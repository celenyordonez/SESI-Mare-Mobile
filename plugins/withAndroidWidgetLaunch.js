const fs = require("node:fs");
const path = require("node:path");
const { withDangerousMod } = require("expo/config-plugins");

/** Permite que o botão Abrir do widget leve ao destino selecionado no app. */
module.exports = function withAndroidWidgetLaunch(config) {
    return withDangerousMod(config, ["android", async (configMod) => {
        const pacoteAndroid = configMod.android?.package;
        if (!pacoteAndroid) {
            throw new Error("Configure android.package antes de gerar o widget da Maré.");
        }

        const diretorioPacote = path.join(
            configMod.modRequest.platformProjectRoot,
            "app",
            "src",
            "main",
            "java",
            ...pacoteAndroid.split("."),
        );
        if (!fs.existsSync(diretorioPacote)) {
            throw new Error("Os provedores Android dos widgets não foram gerados pelo plugin expo-widgets.");
        }
        const arquivosProvedores = fs.readdirSync(diretorioPacote)
            .filter((arquivo) => arquivo.endsWith("Provider.kt"));
        if (!arquivosProvedores.length) {
            throw new Error("Nenhum provedor Android foi gerado pelo plugin expo-widgets.");
        }

        for (const arquivo of arquivosProvedores) {
            const caminhoArquivo = path.join(diretorioPacote, arquivo);
            const codigoAtual = fs.readFileSync(caminhoArquivo, "utf8");
            if (codigoAtual.includes('target.startsWith("mare-open:")')) continue;

            const declaracaoClasse = codigoAtual.trim();
            const codigoComAbertura = `${declaracaoClasse} {
  override fun onReceive(context: android.content.Context, intent: android.content.Intent) {
    if (intent.action == "expo.modules.widgets.ACTION_WIDGET_INTERACTION") {
      val target = intent.getStringExtra("expo.modules.widgets.extra.TARGET").orEmpty()
      if (target.startsWith("mare-open:")) {
        val caminho = target.removePrefix("mare-open:")
        val destino = android.net.Uri.parse("mare://$caminho")
        val abrirApp = context.packageManager.getLaunchIntentForPackage(context.packageName)
        if (abrirApp != null) {
          abrirApp.action = android.content.Intent.ACTION_VIEW
          abrirApp.data = destino
          abrirApp.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP)
          context.startActivity(abrirApp)
        }
        return
      }
    }
    super.onReceive(context, intent)
  }
}
`;
            fs.writeFileSync(caminhoArquivo, codigoComAbertura, "utf8");
        }
        return configMod;
    }]);
};

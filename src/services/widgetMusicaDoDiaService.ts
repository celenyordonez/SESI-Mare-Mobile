import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { requireOptionalNativeModule } from "expo-modules-core";

import type { MusicaDoDia } from "./recomendacaoService";

const CHAVE_URL_CAPA_WIDGET = "mare:widget:capa-musica-do-dia";

type DadosWidgetMusicaDoDia = {
    musicaId: number;
    titulo: string;
    artista: string;
    genero: string;
    capa: string;
};

type WidgetMusicaDoDia = {
    updateSnapshot: (dados: DadosWidgetMusicaDoDia) => void;
};

/** Carrega os módulos do widget só quando o módulo nativo está disponível. */
function obterWidgetNativo() {
    // No Expo Go, o pacote JavaScript existe, mas o módulo nativo não vem incluído.
    if (!requireOptionalNativeModule("ExpoWidgets")) return null;

    try {
        const moduloWidgets = require("expo-widgets") as { widgetsDirectory: string };
        const widget = require("../widgets/MusicaDoDiaWidget") as { default: WidgetMusicaDoDia };

        return {
            diretorio: moduloWidgets.widgetsDirectory,
            widget: widget.default,
        };
    } catch (erro) {
        console.warn("Não foi possível carregar o módulo nativo do widget:", erro);
        return null;
    }
}

/** Copia a capa para o diretório compartilhado que o widget Android consegue ler. */
async function prepararCapaDoWidget(url: string | null | undefined, diretorioWidget: string) {
    if (!url || !diretorioWidget) return "";

    const destino = new File(diretorioWidget, "capa-musica-do-dia");
    const temporario = new File(diretorioWidget, "capa-musica-do-dia-download");

    try {
        const urlAnterior = await AsyncStorage.getItem(CHAVE_URL_CAPA_WIDGET);
        if (urlAnterior !== url || !destino.exists) {
            if (temporario.exists) temporario.delete();
            await File.downloadFileAsync(url, temporario, { idempotent: true });
            if (!temporario.exists || !temporario.size) {
                throw new Error("A capa baixada está vazia.");
            }
            await temporario.move(destino, { overwrite: true });
            await AsyncStorage.setItem(CHAVE_URL_CAPA_WIDGET, url);
        }
        return destino.uri;
    } catch (erro) {
        console.warn("Não foi possível atualizar a capa do widget:", erro);
        try {
            if (temporario.exists) temporario.delete();
        } catch {
            // Uma sobra temporária não impede que o widget use os dados sem imagem.
        }
        const urlAnterior = await AsyncStorage.getItem(CHAVE_URL_CAPA_WIDGET).catch(() => null);
        return destino.exists && urlAnterior === url ? destino.uri : "";
    }
}

/** Atualiza o widget com a música do dia e uma capa acessível no armazenamento compartilhado. */
export async function atualizarWidgetMusicaDoDia(musica: MusicaDoDia["musica"]) {
    if (Platform.OS !== "android") return;

    const moduloWidget = obterWidgetNativo();
    if (!moduloWidget) return;

    const capa = await prepararCapaDoWidget(musica?.capa, moduloWidget.diretorio);
    // O renderer do widget aceita arquivo local, nunca a URL original do catálogo.
    const capaLocal = capa.startsWith("file://") ? capa : "";

    moduloWidget.widget.updateSnapshot({
        musicaId: musica?.id ?? 0,
        titulo: musica?.titulo ?? "Abra a Maré",
        artista: musica?.artista?.nome ?? "Conheça a música de hoje",
        genero: musica?.genero ?? "",
        capa: capaLocal,
    });
}

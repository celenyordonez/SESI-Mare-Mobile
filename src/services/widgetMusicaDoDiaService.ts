import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { File } from "expo-file-system";
import { widgetsDirectory } from "expo-widgets";

import MusicaDoDiaWidget from "../widgets/MusicaDoDiaWidget";
import type { MusicaDoDia } from "./recomendacaoService";

const CHAVE_URL_CAPA_WIDGET = "mare:widget:capa-musica-do-dia";

/** Copia a capa para o diretório compartilhado que o widget Android consegue ler. */
async function prepararCapaDoWidget(url: string | null | undefined) {
    if (!url || !widgetsDirectory) return "";

    const destino = new File(widgetsDirectory, "capa-musica-do-dia");

    try {
        const urlAnterior = await AsyncStorage.getItem(CHAVE_URL_CAPA_WIDGET);
        if (urlAnterior !== url || !destino.exists) {
            await File.downloadFileAsync(url, destino, { idempotent: true });
            await AsyncStorage.setItem(CHAVE_URL_CAPA_WIDGET, url);
        }
        return destino.uri;
    } catch (erro) {
        console.warn("Não foi possível atualizar a capa do widget:", erro);
        return destino.exists ? destino.uri : "";
    }
}

/** Atualiza o widget com a música do dia e uma capa acessível no armazenamento compartilhado. */
export async function atualizarWidgetMusicaDoDia(musica: MusicaDoDia["musica"]) {
    if (Platform.OS !== "android") return;

    const capa = await prepararCapaDoWidget(musica?.capa);

    MusicaDoDiaWidget.updateSnapshot({
        indice: 0,
        titulo: musica?.titulo ?? "Abra a Maré",
        artista: musica?.artista?.nome ?? "Conheça a música de hoje",
        genero: musica?.genero ?? "",
        capa,
    });
}

import { Platform } from "react-native";
import MusicaDoDiaWidget from "../widgets/MusicaDoDiaWidget";
import type { MusicaDoDia } from "./recomendacaoService";

/** Mantém no widget a última música do dia recebida pelo app. */
export function atualizarWidgetMusicaDoDia(musica: MusicaDoDia["musica"]) {
    if (Platform.OS !== "android") return;

    MusicaDoDiaWidget.updateSnapshot({
        indice: 0,
        titulo: musica?.titulo ?? "Abra a Maré",
        artista: musica?.artista?.nome ?? "Conheça a música de hoje",
        genero: musica?.genero ?? "",
        capa: musica?.capa ?? "",
    });
}

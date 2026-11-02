import { useState } from "react";
import { Image as ExpoImage, type ImageStyle } from "expo-image";
import type { StyleProp } from "react-native";

const imagemPadrao = require("../../assets/images/logo.png");

function prepararUrl(url?: string | null) {
    const limpa = url?.trim();
    if (!limpa) return null;
    // URLs relativas ao protocolo e HTTP legado podem falhar na rede nativa do iOS.
    const segura = limpa.startsWith("//")
        ? `https:${limpa}`
        : limpa.replace(/^http:\/\//i, "https://");
    return segura.replace(/ /g, "%20");
}

type Props = {
    url?: string | null;
    style: StyleProp<ImageStyle>;
    contentFit?: "cover" | "contain" | "fill";
    blurRadius?: number;
    descricao?: string;
};

/** Imagem de artista com cache, transição e fallback para URLs indisponíveis. */
export default function FotoArtista({
    url,
    style,
    contentFit = "cover",
    blurRadius,
    descricao = "Foto do artista",
}: Props) {
    const origem = prepararUrl(url);
    const [urlComFalha, setUrlComFalha] = useState<string | null>(null);
    const falhou = origem !== null && urlComFalha === origem;

    return (
        <ExpoImage
            source={falhou || !origem ? imagemPadrao : { uri: origem }}
            style={style}
            contentFit={contentFit}
            blurRadius={blurRadius}
            cachePolicy="memory-disk"
            recyclingKey={origem ?? "artista-sem-foto"}
            transition={180}
            accessibilityLabel={descricao}
            onError={() => setUrlComFalha(origem)}
        />
    );
}

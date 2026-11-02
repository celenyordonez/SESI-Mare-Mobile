import {
    AmazonLogo,
    AppleLogo,
    SpotifyLogo,
    YoutubeLogo,
} from "phosphor-react-native";

type Plataforma = "Spotify" | "YouTube Music" | "Amazon Music" | "Apple Music";

const marcas: Record<Plataforma, { Icone: typeof SpotifyLogo; cor: string }> = {
    Spotify: { Icone: SpotifyLogo, cor: "#1DB954" },
    "YouTube Music": { Icone: YoutubeLogo, cor: "#FF0033" },
    "Amazon Music": { Icone: AmazonLogo, cor: "#25B7D3" },
    "Apple Music": { Icone: AppleLogo, cor: "#FF4E6B" },
};

/** Reutiliza os ícones de marca já disponíveis no conjunto nativo do app. */
export default function PlataformaMusicalIcon({
    plataforma,
    tamanho = 22,
}: {
    plataforma: Plataforma;
    tamanho?: number;
}) {
    const { Icone, cor } = marcas[plataforma];
    return <Icone size={tamanho} color={cor} weight="regular" />;
}

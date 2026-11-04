import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowUpRightIcon, ShareNetworkIcon } from "phosphor-react-native";

import { usePaletaCapa } from "../hooks/usePaletaCapa";
import { corComOpacidade } from "../services/paletaCapaService";

const imagemPadrao = require("../../assets/images/logo.png");

export type MusicaDoChat = {
    id: number;
    titulo: string;
    capa?: string | null;
    artista?: { id?: number; nome: string } | null;
};

type CartaoMusicaChatProps = {
    musica: MusicaDoChat;
    aoPressionar?: () => void;
    carregando?: boolean;
    acao?: "abrir" | "enviar";
};

/** Card compacto de álbum, com borda e brilho nas cores extraídas da capa. */
export default function CartaoMusicaChat({
    musica,
    aoPressionar,
    carregando = false,
    acao = "abrir",
}: CartaoMusicaChatProps) {
    const roteador = useRouter();
    const paleta = usePaletaCapa(musica.capa);
    const corDestaque = paleta?.acento ?? paleta?.dominante ?? "#58AAF0";

    function abrirMusica() {
        if (aoPressionar) {
            aoPressionar();
            return;
        }
        roteador.push(`/musica/${musica.id}` as never);
    }

    return (
        <Pressable
            onPress={abrirMusica}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel={acao === "enviar" ? `Enviar ${musica.titulo} na conversa` : `Abrir ${musica.titulo}`}
            className="w-[148px] overflow-hidden rounded-2xl border bg-[#111722]"
            style={{
                borderColor: corComOpacidade(corDestaque, 0.62),
                shadowColor: corDestaque,
                shadowOpacity: 0.22,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
            }}
        >
            <Image
                source={musica.capa ? { uri: musica.capa } : imagemPadrao}
                className="h-[118px] w-full bg-[#202636]"
                resizeMode="cover"
            />
            <View className="p-2.5">
                <Text className="text-xs font-semibold leading-4 text-white" numberOfLines={2}>
                    {musica.titulo}
                </Text>
                <Text className="mt-1 text-[10px] text-[#C4CFDD]" numberOfLines={1}>
                    {musica.artista?.nome ?? "Artista desconhecido"}
                </Text>
                <View className="mt-2 flex-row items-center">
                    {acao === "enviar"
                        ? <ShareNetworkIcon size={13} color={corDestaque} />
                        : <ArrowUpRightIcon size={13} color={corDestaque} />}
                    <Text className="ml-1 text-[10px] font-medium" style={{ color: corDestaque }}>
                        {acao === "enviar" ? (carregando ? "Enviando…" : "Enviar no chat") : "Abrir música"}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
}

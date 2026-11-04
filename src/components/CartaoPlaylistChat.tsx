import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowUpRightIcon, ShareNetworkIcon } from "phosphor-react-native";

import { usePaletaCapa } from "../hooks/usePaletaCapa";
import { corComOpacidade } from "../services/paletaCapaService";
import type { Playlist } from "../services/playlistService";

const imagemPadrao = require("../../assets/images/logo.png");
const LIMITE_MUSICAS_CARROSSEL = 15;

type CartaoPlaylistChatProps = {
    playlist: Playlist;
    meuId: number | null;
    aoEnviar?: () => void;
    enviando?: boolean;
};

/** Apresenta a playlist com uma faixa horizontal de até 15 capas. */
export default function CartaoPlaylistChat({
    playlist,
    meuId,
    aoEnviar,
    enviando = false,
}: CartaoPlaylistChatProps) {
    const roteador = useRouter();
    const primeiraCapa = playlist.musicas[0]?.musica.capa;
    const paleta = usePaletaCapa(primeiraCapa);
    const corDestaque = paleta?.acento ?? paleta?.dominante ?? "#58AAF0";
    const faixas = playlist.musicas.slice(0, LIMITE_MUSICAS_CARROSSEL);

    function abrirPerfilDaPlaylist() {
        // A playlist própria leva ao perfil privado; a de outra pessoa, ao perfil público.
        if (meuId !== null && playlist.usuario.id === meuId) {
            roteador.push("/perfil" as never);
            return;
        }
        roteador.push(`/u/${encodeURIComponent(playlist.usuario.username)}` as never);
    }

    return (
        <View
            className="w-full overflow-hidden rounded-2xl border bg-[#101722] p-3"
            style={{
                borderColor: corComOpacidade(corDestaque, 0.55),
                shadowColor: corDestaque,
                shadowOpacity: 0.18,
                shadowRadius: 9,
                shadowOffset: { width: 0, height: 2 },
                elevation: 3,
            }}
        >
            <Pressable
                onPress={aoEnviar ? undefined : abrirPerfilDaPlaylist}
                disabled={Boolean(aoEnviar)}
                accessibilityRole={aoEnviar ? undefined : "link"}
                accessibilityLabel={aoEnviar ? undefined : `Abrir perfil de @${playlist.usuario.username}`}
            >
                <View className="flex-row items-start justify-between">
                    <View className="min-w-0 flex-1 pr-2">
                        <Text className="text-[9px] font-bold tracking-[1.5px]" style={{ color: corDestaque }}>
                            {aoEnviar ? "COMPARTILHAR PLAYLIST" : "PLAYLIST"}
                        </Text>
                        <Text className="mt-1 text-sm font-semibold text-white" numberOfLines={2}>
                            {playlist.nome}
                        </Text>
                        <Text className="mt-1 text-[10px] text-[#AAB7C7]" numberOfLines={1}>
                            @{playlist.usuario.username} · {playlist.musicas.length} músicas
                        </Text>
                    </View>
                    {!aoEnviar && <ArrowUpRightIcon size={16} color={corDestaque} />}
                </View>
            </Pressable>

            {faixas.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    className="mt-3"
                    contentContainerStyle={{ gap: 8, paddingRight: 4 }}
                >
                    {faixas.map(({ musica }) => (
                        <Pressable
                            key={musica.id}
                            onPress={aoEnviar ? undefined : () => roteador.push(`/musica/${musica.id}` as never)}
                            className="w-[112px] overflow-hidden rounded-xl border bg-[#151E2A]"
                            style={{ borderColor: corComOpacidade(corDestaque, 0.35) }}
                            accessibilityRole={aoEnviar ? undefined : "link"}
                            accessibilityLabel={aoEnviar ? undefined : `Abrir música ${musica.titulo}`}
                        >
                            <Image
                                source={musica.capa ? { uri: musica.capa } : imagemPadrao}
                                className="h-[92px] w-full bg-[#202636]"
                                resizeMode="cover"
                            />
                            <View className="p-2">
                                <Text className="text-[10px] font-semibold leading-4 text-white" numberOfLines={2}>
                                    {musica.titulo}
                                </Text>
                                <Text className="mt-0.5 text-[9px] text-[#AAB7C7]" numberOfLines={1}>
                                    {musica.artista.nome}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            ) : (
                <Text className="mt-3 text-xs text-[#8793A7]">Esta playlist ainda não tem músicas.</Text>
            )}

            {aoEnviar ? (
                <Pressable
                    onPress={aoEnviar}
                    disabled={enviando}
                    className="mt-3 min-h-10 flex-row items-center justify-center rounded-xl px-3"
                    style={{ backgroundColor: corComOpacidade(corDestaque, 0.18), opacity: enviando ? 0.6 : 1 }}
                >
                    <ShareNetworkIcon size={15} color={corDestaque} />
                    <Text className="ml-2 text-xs font-semibold" style={{ color: corDestaque }}>
                        {enviando ? "Enviando playlist…" : "Enviar playlist"}
                    </Text>
                </Pressable>
            ) : null}
        </View>
    );
}

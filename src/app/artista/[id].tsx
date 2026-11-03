import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { MusicNotesIcon, ShareNetworkIcon, StarIcon } from "phosphor-react-native";

import Topbar from "../../components/topbar";
import Navbar from "../../components/navbar";
import MusicCard from "../../components/musicCard";
import PostCard from "../../components/postCard";
import FotoArtista from "../../components/FotoArtista";
import { buscarArtistaPorId, type Artista } from "../../services/artistaService";
import { buscarMusicas, type Musica } from "../../services/musicaService";
import { buscarPosts, type Post } from "../../services/postService";
import { buscarMeuPerfil } from "../../services/usuarioService";
import { usePaletaCapa } from "../../hooks/usePaletaCapa";
import { corComOpacidade } from "../../services/paletaCapaService";

export default function DetalheArtista() {
    const { id: idParametro } = useLocalSearchParams<{ id: string }>();
    const artistaId = Number(idParametro);
    const [artista, setArtista] = useState<Artista | null>(null);
    const [musicas, setMusicas] = useState<Musica[]>([]);
    const [publicacoes, setPublicacoes] = useState<Post[]>([]);
    const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [revisao, setRevisao] = useState(0);
    const paleta = usePaletaCapa(artista?.fotoURL);
    const corAcento = paleta?.acento ?? "#58AAF0";
    const corDominante = paleta?.dominante ?? "#58AAF0";

    useEffect(() => {
        let ativo = true;

        async function carregarPaginaArtista() {
            if (!Number.isInteger(artistaId) || artistaId < 1) {
                setErro("Não foi possível encontrar este artista.");
                setCarregando(false);
                return;
            }

            try {
                const [dadosArtista, catalogo, todosPosts, meuPerfil] = await Promise.all([
                    buscarArtistaPorId(artistaId),
                    buscarMusicas(),
                    buscarPosts().catch((erroPosts) => {
                        console.error("Erro ao buscar publicações do artista:", erroPosts);
                        return [] as Post[];
                    }),
                    buscarMeuPerfil().catch(() => null),
                ]);
                if (!ativo) return;

                const musicasDoArtista = catalogo.filter(
                    (musica) => musica.artista?.id === artistaId,
                );
                const postsDoArtista = todosPosts.filter(
                    (post) => post.musica?.artista?.id === artistaId,
                );

                setArtista(dadosArtista);
                setMusicas(musicasDoArtista.length ? musicasDoArtista : dadosArtista.musicas ?? []);
                setPublicacoes(postsDoArtista);
                setUsuarioLogadoId(meuPerfil?.id ?? null);
            } catch (erroCarregamento) {
                if (ativo) {
                    setErro(erroCarregamento instanceof Error ? erroCarregamento.message : "Não foi possível carregar este artista.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarPaginaArtista();
        return () => { ativo = false; };
    }, [artistaId, revisao]);

    async function compartilharArtista() {
        if (!artista) return;
        try {
            await Share.share({ message: `Conheça ${artista.nome} na Maré.` });
        } catch (erroCompartilhamento) {
            console.error("Erro ao compartilhar artista:", erroCompartilhamento);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" />

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#5EA7ED" />
                    <Text className="text-[#52677F] dark:text-[#718096] text-sm mt-3">Carregando artista...</Text>
                </View>
            ) : !artista ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-400 text-sm text-center">{erro}</Text>
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => { setErro(""); setCarregando(true); setRevisao((valor) => valor + 1); }} tintColor="#58AAF0" colors={["#58AAF0"]} />}>
                    {/* Capa ampla em camadas, seguindo a página web do artista. */}
                    <View
                        className="relative mx-4 mt-4 h-[250px] overflow-hidden rounded-xl border bg-white dark:bg-[#111420]"
                        style={{
                            borderColor: corComOpacidade(corAcento, 0.58),
                            shadowColor: corDominante,
                            shadowOpacity: 0.34,
                            shadowRadius: 22,
                            shadowOffset: { width: 0, height: 5 },
                            elevation: 6,
                        }}
                    >
                        <FotoArtista
                            url={artista.fotoURL}
                            style={StyleSheet.absoluteFill}
                            blurRadius={18}
                        />
                        <View className="absolute inset-0 bg-black/50" />
                        <View
                            pointerEvents="none"
                            className="absolute -right-12 -top-12 h-48 w-48 rounded-full"
                            style={{ backgroundColor: corComOpacidade(corAcento, 0.24) }}
                        />
                        <View
                            pointerEvents="none"
                            className="absolute left-5 right-5 top-0 h-[2px]"
                            style={{ backgroundColor: corComOpacidade(corAcento, 0.9) }}
                        />
                        <FotoArtista
                            url={artista.fotoURL}
                            style={StyleSheet.absoluteFill}
                            contentFit="contain"
                        />
                        <LinearGradient
                            colors={["rgba(0,0,0,0.02)", "rgba(0,0,0,0.35)", "rgba(0,0,0,0.9)"]}
                            locations={[0, 0.52, 1]}
                            style={StyleSheet.absoluteFill}
                        />
                        <View className="absolute left-5 right-5 bottom-5">
                            <Text className="text-[#155B91] dark:text-[#58AAF0] text-xs uppercase tracking-[3px] mb-2">
                                Artista
                            </Text>
                            <Text className="text-[#142338] dark:text-white text-2xl font-serif" numberOfLines={2}>
                                {artista.nome}
                            </Text>
                            <View className="mt-3 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <MusicNotesIcon size={17} color="#AEB6C5" />
                                    <Text className="text-[#AEB6C5] text-sm ml-2">
                                        {musicas.length} {musicas.length === 1 ? "música" : "músicas"}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => void compartilharArtista()}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Compartilhar artista ${artista.nome}`}
                                    className="h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/50"
                                >
                                    <ShareNetworkIcon size={17} color="#FFFFFF" />
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View className="mt-8 mb-4 px-5 flex-row items-center">
                        <MusicNotesIcon size={20} color="#58AAF0" />
                        <Text className="text-[#142338] dark:text-white text-xl font-serif ml-2">
                            Músicas de {artista.nome}
                        </Text>
                    </View>

                    {musicas.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {musicas.map((musica) => (
                                <MusicCard
                                    key={musica.id}
                                    id={musica.id}
                                    tipo="quadrado"
                                    larguraFixa
                                    titulo={musica.titulo}
                                    artista={artista.nome}
                                    artistaId={artista.id}
                                    capa={musica.capa}
                                    nota={musica.nota}
                                    avaliacoes={musica.avaliacoes}
                                    duracaoSegundos={musica.duracaoSegundos}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <Text className="text-[#52677F] dark:text-[#718096] text-sm px-5 py-2">
                            Nenhuma música cadastrada para este artista.
                        </Text>
                    )}

                    <View className="mt-9 px-5 mb-3 flex-row items-center">
                        <StarIcon size={19} color="#58AAF0" weight="fill" />
                        <Text className="text-[#142338] dark:text-white text-lg font-serif ml-2">
                            Posts sobre {artista.nome}
                        </Text>
                    </View>
                    {publicacoes.length > 0 ? (
                        publicacoes.map((post) => post.musica ? (
                            <PostCard
                                key={post.id}
                                postId={post.id}
                                name={post.usuario?.nome ?? "Usuário"}
                                username={post.usuario?.username ?? ""}
                                foto={post.usuario?.foto}
                                time={post.dataCriacao}
                                content={post.texto}
                                nota={post.nota}
                                editado={post.editado}
                                musicId={post.musica.id}
                                musicTitle={post.musica.titulo}
                                artist={post.musica.artista?.nome ?? artista.nome}
                                artistId={post.musica.artista?.id ?? artista.id}
                                musicCover={post.musica.capa}
                                duracaoSegundos={post.musica.duracaoSegundos}
                                likes={post._count?.curtidas}
                                comments={post._count?.comentarios}
                                curtidoPorMim={post.curtidoPorMim}
                                ehMeuPost={post.usuario?.id === usuarioLogadoId}
                            />
                        ) : null)) : (
                            <Text className="text-[#52677F] dark:text-[#718096] text-sm px-5 py-6">
                                Ainda não há posts sobre este artista.
                            </Text>
                        )}
                    <View className="h-6" />
                </ScrollView>
            )}

            <Navbar />
        </SafeAreaView>
    );
}

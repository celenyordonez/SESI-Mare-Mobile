import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    ImageBackground,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowSquareOutIcon,
    BookmarkSimpleIcon,
    PlusIcon,
    StarIcon,
} from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Topbar from "../../components/topbar";
import Navbar from "../../components/navbar";
import PostCard from "../../components/postCard";
import MusicCard from "../../components/musicCard";
import PlataformaMusicalIcon from "../../components/PlataformaMusicalIcon";
import FotoArtista from "../../components/FotoArtista";
import CompartilharMusicaBotao from "../../components/CompartilharMusicaBotao";
import { usePaletaCapa } from "../../hooks/usePaletaCapa";
import { buscarMusicaPorId, buscarMusicas, buscarPostsDaMusica, type Musica } from "../../services/musicaService";
import { buscarIdsSalvos, alternarSalvamentoMusica } from "../../services/salvamentoService";
import { buscarMeuPerfil } from "../../services/usuarioService";
import { feedbackAcao } from "../../services/feedbackTatil";
import { corComOpacidade } from "../../services/paletaCapaService";
import type { Post } from "../../services/postService";

const capaPadrao = require("../../../assets/images/logo.png");

function normalizar(texto: string) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export default function DetalheMusica() {
    const { id: idParametro } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const musicaId = Number(idParametro);
    const [musica, setMusica] = useState<Musica | null>(null);
    const [avaliacoes, setAvaliacoes] = useState<Post[]>([]);
    const [musicasRelacionadas, setMusicasRelacionadas] = useState<Musica[]>([]);
    const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);
    const [salva, setSalva] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [revisao, setRevisao] = useState(0);
    const paleta = usePaletaCapa(musica?.capa);
    const corDinamica = paleta?.dominante ?? "#58AAF0";

    useEffect(() => {
        let ativo = true;

        async function carregarDetalhes() {
            try {
                const [dadosMusica, dadosAvaliacoes, meuPerfil, catalogo] = await Promise.all([
                    buscarMusicaPorId(musicaId),
                    buscarPostsDaMusica(musicaId),
                    buscarMeuPerfil().catch(() => null),
                    buscarMusicas().catch(() => [] as Musica[]),
                ]);
                if (!ativo) return;

                const generoAtual = normalizar(dadosMusica.genero?.trim() ?? "");
                const relacionadas = generoAtual
                    ? catalogo.filter((item) =>
                        item.id !== musicaId && normalizar(item.genero?.trim() ?? "") === generoAtual,
                    ).slice(0, 6)
                    : [];

                setMusica(dadosMusica);
                setAvaliacoes(dadosAvaliacoes);
                setMusicasRelacionadas(relacionadas);
                setUsuarioLogadoId(meuPerfil?.id ?? null);
            } catch (erroCarregamento) {
                if (ativo) {
                    setErro(erroCarregamento instanceof Error ? erroCarregamento.message : "Não foi possível carregar esta música.");
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        if (Number.isInteger(musicaId) && musicaId > 0) {
            void carregarDetalhes();
        } else {
            setErro("Música não encontrada.");
            setCarregando(false);
        }

        return () => { ativo = false; };
    }, [musicaId, revisao]);

    useEffect(() => {
        let ativo = true;
        buscarIdsSalvos()
            .then((ids) => { if (ativo) setSalva(ids.has(musicaId)); })
            .catch(() => { if (ativo) setSalva(false); });
        return () => { ativo = false; };
    }, [musicaId, revisao]);

    const linksParaOuvir: [string, string][] = musica ? [
        ["Spotify", musica.spotifyUrl],
        ["Apple Music", musica.appleMusicUrl],
        ["Amazon Music", musica.amazonMusicUrl],
        ["YouTube Music", musica.youtubeMusicUrl],
    ].filter((item): item is [string, string] => typeof item[1] === "string" && !!item[1]) : [];

    async function abrirServico(nome: string, link: string) {
        try {
            await Linking.openURL(link);
        } catch {
            Toast.show({ type: "error", text1: `Não foi possível abrir o ${nome}.` });
        }
    }

    async function alternarSalvo() {
        if (salvando) return;
        feedbackAcao();
        try {
            setSalvando(true);
            await alternarSalvamentoMusica(musicaId, salva);
            setSalva((atual) => !atual);
        } catch (erroSalvamento) {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar suas músicas salvas.",
                text2: erroSalvamento instanceof Error ? erroSalvamento.message : undefined,
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" />

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#5EA7ED" />
                    <Text className="text-[#52677F] dark:text-[#718096] text-sm mt-3">Carregando música...</Text>
                </View>
            ) : !musica ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-400 text-sm text-center">{erro || "Música não encontrada."}</Text>
                </View>
            ) : (
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => { setErro(""); setCarregando(true); setRevisao((valor) => valor + 1); }} tintColor="#58AAF0" colors={["#58AAF0"]} />}>
                    {/* Capa ampla com imagem desfocada e informações sobrepostas, como no site. */}
                    <View
                        className="relative mx-4 mt-4 h-[280px] overflow-hidden rounded-xl border bg-white dark:bg-[#111420]"
                        style={{
                            borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.68),
                            shadowColor: corDinamica,
                            shadowOffset: { width: 0, height: 5 },
                            shadowOpacity: 0.3,
                            shadowRadius: 22,
                            elevation: 6,
                        }}
                    >
                        <ImageBackground
                            source={musica.capa ? { uri: musica.capa } : capaPadrao}
                            blurRadius={18}
                            className="absolute inset-0"
                            resizeMode="cover"
                        />
                        <View className="absolute inset-0 bg-black/50" />
                        <View
                            pointerEvents="none"
                            className="absolute inset-0"
                            style={{ backgroundColor: corComOpacidade(paleta?.dominante ?? "#58AAF0", 0.22) }}
                        />
                        <View
                            pointerEvents="none"
                            className="absolute left-5 right-5 top-0 h-px"
                            style={{ backgroundColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.82) }}
                        />
                        <Image
                            source={musica.capa ? { uri: musica.capa } : capaPadrao}
                            className="absolute inset-0 w-full h-full"
                            resizeMode="contain"
                        />
                        <LinearGradient
                            colors={["rgba(0,0,0,0.08)", "rgba(0,0,0,0.42)", "rgba(0,0,0,0.92)"]}
                            locations={[0, 0.5, 1]}
                            style={StyleSheet.absoluteFill}
                        />

                        <View className="absolute top-3 right-3 flex-row items-center">
                            <Pressable
                                onPress={() => void alternarSalvo()}
                                disabled={salvando}
                                accessibilityLabel={salva ? "Remover dos salvos" : "Salvar música"}
                                className="flex-row items-center rounded-lg border px-3 py-2 mr-2"
                                style={{
                                    borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.42),
                                    backgroundColor: corComOpacidade(paleta?.dominante ?? "#000000", 0.6),
                                }}
                            >
                                <BookmarkSimpleIcon size={18} color={salva ? corDinamica : "#FFFFFF"} weight={salva ? "fill" : "regular"} />
                                <Text className={`text-xs ml-2 ${salva ? "text-[#155B91] dark:text-[#58AAF0]" : "text-[#142338] dark:text-white"}`}>
                                    {salvando ? "Salvando..." : salva ? "Salva" : "Salvar"}
                                </Text>
                            </Pressable>
                            <CompartilharMusicaBotao
                                musicaId={musica.id}
                                titulo={musica.titulo}
                                artista={musica.artista?.nome ?? "Artista desconhecido"}
                                classeBotao="mr-2 h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-black/60"
                            />
                            <View className="flex-row items-center rounded-lg bg-black/60 px-3 py-2">
                                <StarIcon size={18} color="#58AAF0" weight="fill" />
                                <Text className="text-[#142338] dark:text-white text-base ml-2">{Number(musica.nota ?? 0).toFixed(1)}</Text>
                            </View>
                        </View>

                        <View className="absolute left-5 right-5 bottom-5">
                            <Text className="text-[#142338] dark:text-white text-[27px] font-serif leading-8" numberOfLines={2}>
                                {musica.titulo}
                            </Text>
                            {musica.artista ? (
                                <Pressable
                                    onPress={() => roteador.push(`/artista/${musica.artista!.id}` as never)}
                                    className="flex-row items-center mt-1"
                                >
                                    {musica.artista.fotoURL ? (
                                        <FotoArtista url={musica.artista.fotoURL} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
                                    ) : null}
                                    <Text className="text-[#D0D0D0] text-sm" numberOfLines={1}>{musica.artista.nome}</Text>
                                </Pressable>
                            ) : null}
                            <View className="flex-row flex-wrap items-center mt-3">
                                {musica.genero ? <Text className="text-[#AEB6C5] text-xs">{musica.genero}</Text> : null}
                                {musica.genero ? <Text className="text-[#687386] mx-2">•</Text> : null}
                                <Text className="text-[#AEB6C5] text-xs">
                                    {musica.avaliacoes ?? avaliacoes.length} {musica.avaliacoes === 1 ? "avaliação" : "avaliações"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {linksParaOuvir.length > 0 ? (
                        <View
                            className="mx-4 mt-5 overflow-hidden rounded-xl border p-4"
                            style={{
                                borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.42),
                                backgroundColor: corComOpacidade(paleta?.dominante ?? "#182131", 0.16),
                            }}
                        >
                            <View
                                pointerEvents="none"
                                className="absolute -right-10 -top-10 h-28 w-28 rounded-full"
                                style={{ backgroundColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.14) }}
                            />
                            <Text style={{ color: paleta?.acento ?? "#FFFFFF" }} className="text-xl font-medium">Ouvir</Text>
                            <Text className="text-[#8D96A6] text-xs mt-1 mb-3">
                                Escolha a plataforma que você usa para ouvir.
                            </Text>
                            <View className="flex-row flex-wrap justify-between">
                                {linksParaOuvir.map(([nome, link]) => (
                                    <Pressable
                                        key={nome}
                                        onPress={() => void abrirServico(nome, link)}
                                        className="w-[48%] h-11 flex-row items-center rounded-md border px-3 mb-2"
                                        style={{
                                            borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.22),
                                            backgroundColor: corComOpacidade(paleta?.dominante ?? "#111420", 0.12),
                                        }}
                                    >
                                        <PlataformaMusicalIcon plataforma={nome as "Spotify" | "YouTube Music" | "Amazon Music" | "Apple Music"} tamanho={21} />
                                        <Text className="flex-1 text-[#142338] dark:text-white text-xs ml-2" numberOfLines={1}>{nome}</Text>
                                        <ArrowSquareOutIcon size={14} color={paleta?.acento ?? "#8495A9"} />
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    <View className="mt-8">
                        <Text className="text-[#142338] dark:text-white text-2xl font-serif px-5 mb-3">Músicas relacionadas</Text>
                        {musicasRelacionadas.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                                {musicasRelacionadas.map((relacionada) => (
                                    <MusicCard
                                        key={relacionada.id}
                                        id={relacionada.id}
                                        tipo="quadrado"
                                        larguraFixa
                                        titulo={relacionada.titulo}
                                        artista={relacionada.artista?.nome}
                                        artistaId={relacionada.artista?.id}
                                        capa={relacionada.capa}
                                        nota={relacionada.nota}
                                        avaliacoes={relacionada.avaliacoes}
                                        duracaoSegundos={relacionada.duracaoSegundos}
                                    />
                                ))}
                            </ScrollView>
                        ) : (
                            <Text className="text-[#52677F] dark:text-[#718096] text-sm px-5">Nenhuma música relacionada encontrada.</Text>
                        )}
                    </View>

                    <Pressable
                        onPress={() => roteador.push({ pathname: "/criar", params: { musica: String(musicaId) } })}
                        className="h-12 flex-row items-center justify-center rounded-lg bg-[#58AAF0] mx-4 mt-7"
                        style={{
                            shadowColor: corDinamica,
                            shadowOffset: { width: 0, height: 3 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 4,
                        }}
                    >
                        <PlusIcon size={17} color="#07111E" weight="bold" />
                        <Text className="text-[#07111E] text-sm font-serif ml-2">Adicionar uma avaliação</Text>
                    </Pressable>

                    <View className="mt-8 px-5">
                        <Text className="text-[#142338] dark:text-white text-lg font-serif">Posts relacionados</Text>
                    </View>
                    {avaliacoes.length > 0 ? (
                        avaliacoes.map((avaliacao) => (
                            <PostCard
                                key={avaliacao.id}
                                postId={avaliacao.id}
                                name={avaliacao.usuario?.nome ?? "Usuário"}
                                username={avaliacao.usuario?.username ?? ""}
                                foto={avaliacao.usuario?.foto}
                                time={avaliacao.dataCriacao}
                                content={avaliacao.texto}
                                nota={avaliacao.nota}
                                editado={avaliacao.editado}
                                musicId={musicaId}
                                musicTitle={musica.titulo}
                                artist={musica.artista?.nome ?? "Artista desconhecido"}
                                artistId={musica.artista?.id}
                                musicCover={musica.capa}
                                duracaoSegundos={musica.duracaoSegundos}
                                likes={avaliacao._count?.curtidas ?? 0}
                                comments={avaliacao._count?.comentarios ?? 0}
                                curtidoPorMim={avaliacao.curtidoPorMim ?? false}
                                ehMeuPost={avaliacao.usuario?.id === usuarioLogadoId}
                            />
                        ))
                    ) : (
                        <Text className="text-[#52677F] dark:text-[#718096] text-sm px-5 py-6">Nenhum post feito.</Text>
                    )}
                    <View className="h-6" />
                </ScrollView>
            )}
            <Navbar />
        </SafeAreaView>
    );
}

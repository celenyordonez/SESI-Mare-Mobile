import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import AtalhoMusicalCard from "../components/AtalhoMusicalCard";
import MusicCard from "../components/musicCard";
import PostCard from "../components/postCard";
import Searchbar from "../components/searchBar";
import FotoArtista from "../components/FotoArtista";
import { ClockCounterClockwiseIcon, XIcon } from "phosphor-react-native";
import { useBuscaGlobal } from "../hooks/useBuscaGlobal";
import type { Musica } from "../services/musicaService";
import { embaralharLista } from "../services/recomendacaoService";
import {
    buscarHistoricoPesquisa,
    limparHistoricoPesquisa,
    registrarPesquisa,
    removerPesquisaDoHistorico,
} from "../services/historicoPesquisaService";

function normalizar(value: unknown) {
    return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export default function Explorar() {
    const router = useRouter();
    const parametros = useLocalSearchParams<{ q?: string }>();
    const termoDaRota = parametros.q?.trim() ?? "";
    const [termo, setTermo] = useState(termoDaRota);
    const [historico, setHistorico] = useState<string[]>([]);
    const { musicas, artistas, posts, usuarios, generosFavoritos, artistasFavoritos,
        usuarioLogadoId, carregando, erro, buscando, resultados: resultadosBusca, recarregar } = useBuscaGlobal(termo);

    useEffect(() => {
        let ativo = true;
        void buscarHistoricoPesquisa().then((itens) => {
            if (ativo) setHistorico(itens);
        });
        return () => { ativo = false; };
    }, []);

    useEffect(() => {
        setTermo(termoDaRota);
    }, [termoDaRota]);

    async function guardarPesquisa(valor: string) {
        if (!valor.trim()) return;
        try {
            setHistorico(await registrarPesquisa(valor));
        } catch (erroHistorico) {
            console.warn("Não foi possível salvar esta pesquisa no histórico.", erroHistorico);
        }
    }

    async function removerPesquisa(valor: string) {
        try {
            setHistorico(await removerPesquisaDoHistorico(valor));
        } catch (erroHistorico) {
            console.warn("Não foi possível remover esta pesquisa do histórico.", erroHistorico);
        }
    }

    async function limparPesquisas() {
        try {
            await limparHistoricoPesquisa();
            setHistorico([]);
        } catch (erroHistorico) {
            console.warn("Não foi possível limpar o histórico de pesquisa.", erroHistorico);
        }
    }

    const contagemPosts = useMemo(() => {
        const counts = new Map<number, number>();
        posts.forEach((post) => { const id = post.musica?.id; if (id != null) counts.set(id, (counts.get(id) ?? 0) + 1); });
        return counts;
    }, [posts]);
    const emAlta = useMemo(() => [...musicas].sort((a, b) => (contagemPosts.get(b.id) ?? 0) - (contagemPosts.get(a.id) ?? 0) || (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)).slice(0, 8), [musicas, contagemPosts]);
    const bemAvaliadas = useMemo(() => [...musicas].filter((m) => (m.avaliacoes ?? 0) > 0).sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0) || (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)).slice(0, 8), [musicas]);
    const imagensPersonalizadas = useMemo(() => {
        const generos = new Set(generosFavoritos.map(normalizar));
        const idsArtistas = new Set(artistasFavoritos.map((artista) => artista.artistaId));
        const favoritas = musicas.filter((musica) =>
            (musica.genero && generos.has(normalizar(musica.genero))) ||
            (musica.artista?.id != null && idsArtistas.has(musica.artista.id)),
        );
        return embaralharLista(favoritas.filter((musica) => musica.capa));
    }, [musicas, generosFavoritos, artistasFavoritos]);
    const imagensCatalogoEmbaralhadas = useMemo(
        () => embaralharLista(musicas.filter((musica) => musica.capa)),
        [musicas],
    );
    const artistasPersonalizadosEmbaralhados = useMemo(() => {
        const idsArtistas = new Set(artistasFavoritos.map((artista) => artista.artistaId));
        return embaralharLista(artistas.filter((artista) => idsArtistas.has(artista.id) && artista.fotoURL));
    }, [artistas, artistasFavoritos]);
    const recomendadas = useMemo(() => {
        const generos = new Set(generosFavoritos.map(normalizar));
        const idsArtistas = new Set(artistasFavoritos.map((a) => a.artistaId));
        return musicas.filter((m) => (m.genero && generos.has(normalizar(m.genero))) || (m.artista?.id != null && idsArtistas.has(m.artista.id))).slice(0, 8);
    }, [musicas, generosFavoritos, artistasFavoritos]);
    const postsRecentes = useMemo(() => posts.slice(0, 8), [posts]);

    function secaoMusicas(titulo: string, lista: Musica[], tipo: "banner" | "quadrado") {
        return <View className="mt-7">
            <Text className="text-white text-lg font-serif mx-6 mb-3">{titulo}</Text>
            {lista.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                {lista.map((m) => <MusicCard key={m.id} id={m.id} tipo={tipo} larguraFixa={tipo === "quadrado"} titulo={m.titulo} artista={m.artista?.nome ?? "Artista desconhecido"} artistaId={m.artista?.id} capa={m.capa} nota={m.nota} avaliacoes={m.avaliacoes} duracaoSegundos={m.duracaoSegundos} />)}
            </ScrollView> : <Text className="text-[#718096] text-sm mx-6">{carregando ? "Carregando músicas..." : "Nenhuma música encontrada."}</Text>}
        </View>;
    }

    function resultadosPesquisa() {
        const temResultado = resultadosBusca.musicas.length + resultadosBusca.artistas.length + resultadosBusca.usuarios.length + resultadosBusca.posts.length > 0;
        if (!buscando) return null;
        if (carregando) return <View className="py-10"><ActivityIndicator color="#5EA7ED" /></View>;
        if (erro) return <Text className="text-red-400 text-sm text-center px-6 py-8">Não foi possível carregar os resultados. Tente novamente.</Text>;
        if (!temResultado) return <Text className="text-[#718096] text-sm text-center px-6 py-8">Nenhum resultado encontrado para “{termo.trim()}”.</Text>;
        return <View className="px-5 pt-5">
            <Text className="text-[#718096] text-xs mb-4">Resultados para “{termo.trim()}”</Text>
            {!!resultadosBusca.musicas.length && <View className="mb-6"><Text className="text-white text-lg font-serif mb-3">Músicas ({resultadosBusca.musicas.length})</Text>{resultadosBusca.musicas.map((m) => <View key={m.id} className="mb-3"><MusicCard id={m.id} tipo="post" titulo={m.titulo} artista={m.artista?.nome ?? "Artista desconhecido"} artistaId={m.artista?.id} capa={m.capa} nota={m.nota} avaliacoes={m.avaliacoes} duracaoSegundos={m.duracaoSegundos} /></View>)}</View>}
            {!!resultadosBusca.usuarios.length && <View className="mb-6"><Text className="text-white text-lg font-serif mb-3">Pessoas ({resultadosBusca.usuarios.length})</Text>{resultadosBusca.usuarios.map((u) => <Pressable key={u.id} onPress={() => router.push(`/u/${encodeURIComponent(u.username)}` as never)} className="flex-row items-center p-3 mb-2 rounded-xl border border-[#252D3C] bg-[#111420]"><Image source={u.foto ? { uri: u.foto } : require("../../assets/images/logo.png")} className="w-12 h-12 rounded-full" /><View className="ml-3"><Text className="text-white text-sm">{u.nome}</Text><Text className="text-[#718096] text-xs mt-1">@{u.username}</Text></View></Pressable>)}</View>}
            {!!resultadosBusca.artistas.length && <View className="mb-6"><Text className="text-white text-lg font-serif mb-3">Artistas ({resultadosBusca.artistas.length})</Text>{resultadosBusca.artistas.map((a) => <Pressable key={a.id} onPress={() => router.push(`/artista/${a.id}` as never)} className="flex-row items-center p-3 mb-2 rounded-xl border border-[#252D3C] bg-[#111420]"><FotoArtista url={a.fotoURL} style={{ width: 48, height: 48, borderRadius: 24 }} /><Text className="text-white text-sm ml-3">{a.nome}</Text></Pressable>)}</View>}
            {!!resultadosBusca.posts.length && <View className="mb-5"><Text className="text-white text-lg font-serif mb-2">Posts ({resultadosBusca.posts.length})</Text>{resultadosBusca.posts.map((p) => p.musica && <PostCard key={p.id} postId={p.id} name={p.usuario?.nome} username={p.usuario?.username} foto={p.usuario?.foto} time={p.dataCriacao} content={p.texto} nota={p.nota} editado={p.editado} musicId={p.musica.id} musicTitle={p.musica.titulo} artist={p.musica.artista?.nome} artistId={p.musica.artista?.id} musicCover={p.musica.capa} duracaoSegundos={p.musica.duracaoSegundos} likes={p._count?.curtidas} comments={p._count?.comentarios} curtidoPorMim={p.curtidoPorMim} ehMeuPost={p.usuario?.id === usuarioLogadoId} />)}</View>}
        </View>;
    }

    return <SafeAreaView className="flex-1 bg-[#080A10]">
        <Topbar titulo="Explorar" subtitulo="Encontre músicas, artistas e pessoas" />
        <Searchbar
            value={termo}
            onChangeText={setTermo}
            onSubmitEditing={(valor) => void guardarPesquisa(valor)}
            onEndEditing={(valor) => void guardarPesquisa(valor)}
        />
        {buscando ? <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void recarregar()} tintColor="#58AAF0" colors={["#58AAF0"]} />}>{resultadosPesquisa()}</ScrollView> : <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void recarregar()} tintColor="#58AAF0" colors={["#58AAF0"]} />}>
            {historico.length > 0 && (
                <View className="mt-3">
                    <View className="mx-6 mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <ClockCounterClockwiseIcon size={16} color="#8793A7" />
                            <Text className="ml-2 text-sm font-medium text-white">Pesquisas recentes</Text>
                        </View>
                        <Pressable onPress={() => void limparPesquisas()} accessibilityRole="button" accessibilityLabel="Limpar histórico de pesquisa">
                            <Text className="text-xs text-[#83C6FF]">Limpar</Text>
                        </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {historico.map((pesquisa) => (
                            <View key={pesquisa} className="mr-2 flex-row overflow-hidden rounded-full border border-[#252D3C] bg-[#111420]">
                                <Pressable
                                    onPress={() => setTermo(pesquisa)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Pesquisar novamente: ${pesquisa}`}
                                    className="flex-row items-center py-2 pl-3 pr-2"
                                >
                                    <Text className="max-w-[160px] text-xs text-[#D0D0D5]" numberOfLines={1}>{pesquisa}</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => void removerPesquisa(pesquisa)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Remover ${pesquisa} do histórico`}
                                    className="items-center justify-center px-2"
                                >
                                    <XIcon size={13} color="#8793A7" />
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}
            {erro && <Text className="text-red-400 text-sm mx-6 mt-4">Não foi possível carregar o conteúdo.</Text>}
            {carregando && musicas.length === 0 ? <View className="py-10"><ActivityIndicator color="#5EA7ED" /></View> : <>
                {secaoMusicas("Em alta", emAlta, "banner")}
                <View className="mt-7">
                    <Text className="text-white text-lg font-serif mx-6 mb-3">Mais para explorar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        <AtalhoMusicalCard
                            tipo="descoberta"
                            imagem={imagensPersonalizadas[0]?.capa ?? imagensCatalogoEmbaralhadas[0]?.capa}
                        />
                        <AtalhoMusicalCard
                            tipo="universo"
                            imagem={artistasPersonalizadosEmbaralhados[0]?.fotoURL ?? imagensPersonalizadas[1]?.capa ?? imagensCatalogoEmbaralhadas[1]?.capa}
                        />
                    </ScrollView>
                </View>
                {secaoMusicas("Mais bem avaliadas", bemAvaliadas, "quadrado")}
                {secaoMusicas("Talvez você goste", recomendadas, "quadrado")}
                <View className="mt-7"><Text className="text-white text-lg font-serif mx-6 mb-3">Artistas</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {artistas.slice(0, 12).map((a) => <Pressable key={a.id} onPress={() => router.push(`/artista/${a.id}` as never)} className="w-[104px] items-center mr-4"><FotoArtista url={a.fotoURL} style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: "#171E2B" }} /><Text className="text-white text-xs text-center mt-2" numberOfLines={1}>{a.nome}</Text></Pressable>)}
                </ScrollView></View>
                <View className="mt-7"><Text className="text-white text-lg font-serif mx-6 mb-2">Publicações recentes</Text>{postsRecentes.length ? postsRecentes.map((p) => p.musica && <PostCard key={p.id} postId={p.id} name={p.usuario?.nome} username={p.usuario?.username} foto={p.usuario?.foto} time={p.dataCriacao} content={p.texto} nota={p.nota} editado={p.editado} musicId={p.musica.id} musicTitle={p.musica.titulo} artist={p.musica.artista?.nome} artistId={p.musica.artista?.id} musicCover={p.musica.capa} duracaoSegundos={p.musica.duracaoSegundos} likes={p._count?.curtidas} comments={p._count?.comentarios} curtidoPorMim={p.curtidoPorMim} ehMeuPost={p.usuario?.id === usuarioLogadoId} />) : <Text className="text-[#718096] text-sm mx-6">Nenhuma publicação encontrada.</Text>}</View>
            </>}
            <View className="h-6" />
        </ScrollView>}
        <Navbar />
    </SafeAreaView>;
}

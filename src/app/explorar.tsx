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
import { ClockCounterClockwiseIcon, FunnelIcon, XIcon } from "phosphor-react-native";
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

type SecaoMusicasProps = {
    titulo: string;
    lista: Musica[];
    tipo: "banner" | "quadrado";
    carregando: boolean;
};

function SecaoMusicas({ titulo, lista, tipo, carregando }: SecaoMusicasProps) {
    return (
        <View className="mt-7">
            <Text className="text-[#142338] dark:text-white text-lg font-serif mx-6 mb-3">{titulo}</Text>
            {lista.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {lista.map((musica) => (
                        <MusicCard
                            key={musica.id}
                            id={musica.id}
                            tipo={tipo}
                            larguraFixa={tipo === "quadrado"}
                            titulo={musica.titulo}
                            artista={musica.artista?.nome ?? "Artista desconhecido"}
                            artistaId={musica.artista?.id}
                            capa={musica.capa}
                            nota={musica.nota}
                            avaliacoes={musica.avaliacoes}
                            duracaoSegundos={musica.duracaoSegundos}
                        />
                    ))}
                </ScrollView>
            ) : (
                <Text className="text-[#52677F] dark:text-[#718096] text-sm mx-6">
                    {carregando ? "Carregando músicas..." : "Nenhuma música encontrada."}
                </Text>
            )}
        </View>
    );
}

export default function Explorar() {
    const router = useRouter();
    const parametros = useLocalSearchParams<{ q?: string }>();
    const termoDaRota = parametros.q?.trim() ?? "";
    const [termo, setTermo] = useState(termoDaRota);
    const [historico, setHistorico] = useState<string[]>([]);
    const [filtrosAbertos, setFiltrosAbertos] = useState(false);
    const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
    const [ordemResultados, setOrdemResultados] = useState<"catalogo" | "nota" | "avaliacoes" | "titulo">("catalogo");
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
    const generosDisponiveis = useMemo(() => [...new Set(musicas.map((musica) => musica.genero?.trim()).filter((genero): genero is string => Boolean(genero)))].sort((a, b) => a.localeCompare(b, "pt-BR")), [musicas]);
    const musicasFiltradas = useMemo(() => {
        const generos = new Set(generosSelecionados.map(normalizar));
        const resultado = musicas.filter((musica) => {
            const generoCorresponde = generos.size === 0 || generos.has(normalizar(musica.genero));
            return generoCorresponde;
        });

        if (ordemResultados === "nota") return resultado.sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0));
        if (ordemResultados === "avaliacoes") return resultado.sort((a, b) => (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0));
        if (ordemResultados === "titulo") return resultado.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
        return resultado;
    }, [musicas, generosSelecionados, ordemResultados]);
    const artistasFiltrados = useMemo(() => {
        const generosFavoritosNormalizados = new Set(generosFavoritos.map(normalizar));
        const artistasDosGenerosFavoritos = new Set(musicas
            .filter((musica) => generosFavoritosNormalizados.has(normalizar(musica.genero)))
            .map((musica) => musica.artista?.id)
            .filter((id): id is number => id != null));
        return [...artistas].sort((a, b) =>
            Number(artistasDosGenerosFavoritos.has(b.id)) - Number(artistasDosGenerosFavoritos.has(a.id)) ||
            a.nome.localeCompare(b.nome, "pt-BR")
        );
    }, [artistas, musicas, generosFavoritos]);
    const quantidadeFiltrosAtivos = generosSelecionados.length + Number(ordemResultados !== "catalogo");
    const emAlta = useMemo(() => [...musicasFiltradas].sort((a, b) => (contagemPosts.get(b.id) ?? 0) - (contagemPosts.get(a.id) ?? 0) || (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)).slice(0, 8), [musicasFiltradas, contagemPosts]);
    const bemAvaliadas = useMemo(() => [...musicasFiltradas].filter((m) => (m.avaliacoes ?? 0) > 0).sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0) || (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)).slice(0, 8), [musicasFiltradas]);
    const imagensPersonalizadas = useMemo(() => {
        const generos = new Set(generosFavoritos.map(normalizar));
        const idsArtistas = new Set(artistasFavoritos.map((artista) => artista.artistaId));
        const favoritas = musicasFiltradas.filter((musica) =>
            (musica.genero && generos.has(normalizar(musica.genero))) ||
            (musica.artista?.id != null && idsArtistas.has(musica.artista.id)),
        );
        return embaralharLista(favoritas.filter((musica) => musica.capa));
    }, [musicasFiltradas, generosFavoritos, artistasFavoritos]);
    const imagensCatalogoEmbaralhadas = useMemo(
        () => embaralharLista(musicasFiltradas.filter((musica) => musica.capa)),
        [musicasFiltradas],
    );
    const artistasPersonalizadosEmbaralhados = useMemo(() => {
        const idsArtistas = new Set(artistasFavoritos.map((artista) => artista.artistaId));
        return embaralharLista(artistas.filter((artista) => idsArtistas.has(artista.id) && artista.fotoURL));
    }, [artistas, artistasFavoritos]);
    const recomendadas = useMemo(() => {
        const generos = new Set(generosFavoritos.map(normalizar));
        const idsArtistas = new Set(artistasFavoritos.map((a) => a.artistaId));
        return musicasFiltradas.filter((m) => (m.genero && generos.has(normalizar(m.genero))) || (m.artista?.id != null && idsArtistas.has(m.artista.id))).slice(0, 8);
    }, [musicasFiltradas, generosFavoritos, artistasFavoritos]);
    // Mostra recomendações agrupadas pela preferência real que fez a música entrar na lista.
    const secoesRecomendadas = useMemo(() => {
        const secoes: { titulo: string; musicas: Musica[] }[] = [];
        generosFavoritos.slice(0, 3).forEach((genero) => {
            const correspondentes = musicasFiltradas.filter((musica) => normalizar(musica.genero) === normalizar(genero));
            if (correspondentes.length) secoes.push({ titulo: `Você que curte ${genero}`, musicas: correspondentes.slice(0, 8) });
        });
        artistasFavoritos.slice(0, 3).forEach(({ artistaId }) => {
            const artista = artistas.find((item) => item.id === artistaId);
            const correspondentes = musicasFiltradas.filter((musica) => musica.artista?.id === artistaId);
            if (artista && correspondentes.length) secoes.push({ titulo: `Porque você escolheu ${artista.nome}`, musicas: correspondentes.slice(0, 8) });
        });
        return secoes;
    }, [musicasFiltradas, generosFavoritos, artistasFavoritos, artistas]);
    const postsRecentes = useMemo(() => posts.slice(0, 8), [posts]);

    function alternarGenero(genero: string) {
        setGenerosSelecionados((selecionados) => selecionados.includes(genero)
            ? selecionados.filter((item) => item !== genero)
            : [...selecionados, genero]);
    }

    function limparFiltros() {
        setGenerosSelecionados([]);
        setOrdemResultados("catalogo");
    }

    function renderizarFiltros() {
        return <View className="mx-6 mt-2">
            <Pressable onPress={() => setFiltrosAbertos((aberto) => !aberto)} accessibilityRole="button" accessibilityState={{ expanded: filtrosAbertos }} className="min-h-9 self-start flex-row items-center py-1">
                <FunnelIcon size={15} color={quantidadeFiltrosAtivos ? "#58AAF0" : "#8793A7"} />
                <Text className={`ml-1.5 text-xs ${quantidadeFiltrosAtivos ? "font-medium text-[#155B91] dark:text-[#8CC8FF]" : "text-[#52677F] dark:text-[#8793A7]"}`}>{filtrosAbertos ? "Fechar filtros" : "Filtros"}{quantidadeFiltrosAtivos > 0 ? ` · ${quantidadeFiltrosAtivos}` : ""}</Text>
            </Pressable>

            {filtrosAbertos && <View className="mt-2 pb-3 border-b border-[#D5E0EC] dark:border-[#252D3C]">
                <Text className="mb-2 mt-4 text-xs font-medium text-[#52677F] dark:text-[#8793A7]">Gêneros</Text>
                <View className="flex-row flex-wrap">
                    {generosDisponiveis.map((genero) => {
                        const selecionado = generosSelecionados.includes(genero);
                        return <Pressable key={genero} onPress={() => alternarGenero(genero)} accessibilityRole="button" accessibilityState={{ selected: selecionado }} className={`mb-2 mr-2 rounded-full border px-3 py-2 ${selecionado ? "border-[#58AAF0] bg-[#58AAF0]/15" : "border-[#C5D3E1] dark:border-[#354052]"}`}><Text className={`text-xs ${selecionado ? "text-[#155B91] dark:text-[#8CC8FF]" : "text-[#52677F] dark:text-[#8793A7]"}`}>{genero}</Text></Pressable>;
                    })}
                    {!generosDisponiveis.length && <Text className="text-xs text-[#718096]">Nenhum gênero cadastrado.</Text>}
                </View>

                <Text className="mb-2 mt-3 text-xs font-medium text-[#52677F] dark:text-[#8793A7]">Ordenar músicas</Text>
                <View className="flex-row flex-wrap">
                    {([["catalogo", "Catálogo"], ["nota", "Melhor nota"], ["avaliacoes", "Mais avaliadas"], ["titulo", "A–Z"]] as const).map(([ordem, titulo]) => {
                        const selecionada = ordemResultados === ordem;
                        return <Pressable key={ordem} onPress={() => setOrdemResultados(ordem)} className={`mb-2 mr-2 rounded-full border px-3 py-2 ${selecionada ? "border-[#58AAF0] bg-[#58AAF0]/15" : "border-[#C5D3E1] dark:border-[#354052]"}`}><Text className={`text-xs ${selecionada ? "text-[#155B91] dark:text-[#8CC8FF]" : "text-[#52677F] dark:text-[#8793A7]"}`}>{titulo}</Text></Pressable>;
                    })}
                </View>

                {quantidadeFiltrosAtivos > 0 && <Pressable onPress={limparFiltros} accessibilityRole="button" className="mt-1 self-start flex-row items-center py-2"><XIcon size={15} color="#8793A7" /><Text className="ml-1 text-xs text-[#52677F] dark:text-[#8793A7]">Limpar filtros</Text></Pressable>}
            </View>}
        </View>;
    }

    function resultadosPesquisa() {
        const temResultado = resultadosBusca.musicas.length + resultadosBusca.artistas.length + resultadosBusca.usuarios.length + resultadosBusca.posts.length > 0;
        if (!buscando) return null;
        if (carregando) return <View className="py-10"><ActivityIndicator color="#5EA7ED" /></View>;
        if (erro) return <Text className="text-red-400 text-sm text-center px-6 py-8">Não foi possível carregar os resultados. Tente novamente.</Text>;
        if (!temResultado) return <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center px-6 py-8">Nenhum resultado encontrado para “{termo.trim()}”.</Text>;
        return <View className="px-5 pt-5">
            <Text className="text-[#52677F] dark:text-[#718096] text-xs mb-4">Resultados para “{termo.trim()}”</Text>
            {!!resultadosBusca.musicas.length && <View className="mb-6"><Text className="text-[#142338] dark:text-white text-lg font-serif mb-3">Músicas ({resultadosBusca.musicas.length})</Text>{resultadosBusca.musicas.map((m) => <View key={m.id} className="mb-3"><MusicCard id={m.id} tipo="post" titulo={m.titulo} artista={m.artista?.nome ?? "Artista desconhecido"} artistaId={m.artista?.id} capa={m.capa} nota={m.nota} avaliacoes={m.avaliacoes} duracaoSegundos={m.duracaoSegundos} /></View>)}</View>}
            {!!resultadosBusca.usuarios.length && <View className="mb-6"><Text className="text-[#142338] dark:text-white text-lg font-serif mb-3">Pessoas ({resultadosBusca.usuarios.length})</Text>{resultadosBusca.usuarios.map((u) => <Pressable key={u.id} onPress={() => router.push(`/u/${encodeURIComponent(u.username)}` as never)} className="flex-row items-center p-3 mb-2 rounded-xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420]"><Image source={u.foto ? { uri: u.foto } : require("../../assets/images/logo.png")} className="w-12 h-12 rounded-full" /><View className="ml-3"><Text className="text-[#142338] dark:text-white text-sm">{u.nome}</Text><Text className="text-[#52677F] dark:text-[#718096] text-xs mt-1">@{u.username}</Text></View></Pressable>)}</View>}
            {!!resultadosBusca.artistas.length && <View className="mb-6"><Text className="text-[#142338] dark:text-white text-lg font-serif mb-3">Artistas ({resultadosBusca.artistas.length})</Text>{resultadosBusca.artistas.map((a) => <Pressable key={a.id} onPress={() => router.push(`/artista/${a.id}` as never)} className="flex-row items-center p-3 mb-2 rounded-xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420]"><FotoArtista url={a.fotoURL} style={{ width: 48, height: 48, borderRadius: 24 }} /><Text className="text-[#142338] dark:text-white text-sm ml-3">{a.nome}</Text></Pressable>)}</View>}
            {!!resultadosBusca.posts.length && <View className="mb-5"><Text className="text-[#142338] dark:text-white text-lg font-serif mb-2">Posts ({resultadosBusca.posts.length})</Text>{resultadosBusca.posts.map((p) => p.musica && <PostCard key={p.id} postId={p.id} name={p.usuario?.nome} username={p.usuario?.username} foto={p.usuario?.foto} time={p.dataCriacao} content={p.texto} nota={p.nota} editado={p.editado} musicId={p.musica.id} musicTitle={p.musica.titulo} artist={p.musica.artista?.nome} artistId={p.musica.artista?.id} musicCover={p.musica.capa} duracaoSegundos={p.musica.duracaoSegundos} likes={p._count?.curtidas} comments={p._count?.comentarios} curtidoPorMim={p.curtidoPorMim} ehMeuPost={p.usuario?.id === usuarioLogadoId} />)}</View>}
        </View>;
    }

    return <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
        <Topbar titulo="Explorar" subtitulo="Encontre músicas, artistas e pessoas" />
        <Searchbar
            value={termo}
            onChangeText={setTermo}
            onSubmitEditing={(valor) => void guardarPesquisa(valor)}
            onEndEditing={(valor) => void guardarPesquisa(valor)}
        />
        {!buscando ? renderizarFiltros() : null}
        {buscando ? <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void recarregar()} tintColor="#58AAF0" colors={["#58AAF0"]} />}>{resultadosPesquisa()}</ScrollView> : <ScrollView className="flex-1" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={carregando} onRefresh={() => void recarregar()} tintColor="#58AAF0" colors={["#58AAF0"]} />}>
            {historico.length > 0 && (
                <View className="mt-3">
                    <View className="mx-6 mb-3 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <ClockCounterClockwiseIcon size={16} color="#8793A7" />
                            <Text className="ml-2 text-sm font-medium text-[#142338] dark:text-white">Pesquisas recentes</Text>
                        </View>
                        <Pressable onPress={() => void limparPesquisas()} accessibilityRole="button" accessibilityLabel="Limpar histórico de pesquisa">
                            <Text className="text-xs text-[#83C6FF]">Limpar</Text>
                        </Pressable>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        {historico.map((pesquisa) => (
                            <View key={pesquisa} className="mr-2 flex-row overflow-hidden rounded-full border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420]">
                                <Pressable
                                    onPress={() => setTermo(pesquisa)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Pesquisar novamente: ${pesquisa}`}
                                    className="flex-row items-center py-2 pl-3 pr-2"
                                >
                                    <Text className="max-w-[160px] text-xs text-[#405570] dark:text-[#D0D0D5]" numberOfLines={1}>{pesquisa}</Text>
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
            {carregando && musicas.length === 0 ? <View className="py-10"><ActivityIndicator color="#5EA7ED" /></View> : quantidadeFiltrosAtivos > 0 ? (
                <View className="mt-6 px-5">
                    <Text className="mb-3 font-serif text-lg text-[#142338] dark:text-white">Músicas encontradas ({musicasFiltradas.length})</Text>
                    {musicasFiltradas.length ? musicasFiltradas.map((musica) => <View key={musica.id} className="mb-3"><MusicCard id={musica.id} tipo="post" titulo={musica.titulo} artista={musica.artista?.nome ?? "Artista desconhecido"} artistaId={musica.artista?.id} capa={musica.capa} nota={musica.nota} avaliacoes={musica.avaliacoes} duracaoSegundos={musica.duracaoSegundos} /></View>) : <Text className="mb-4 text-sm text-[#52677F] dark:text-[#8793A7]">Nenhuma música corresponde aos filtros selecionados.</Text>}
                    {generosSelecionados.length === 0 && (
                        <>
                            <Text className="mb-3 mt-4 font-serif text-lg text-[#142338] dark:text-white">Artistas ({artistasFiltrados.length})</Text>
                            {artistasFiltrados.map((artista) => <Pressable key={artista.id} onPress={() => router.push(`/artista/${artista.id}` as never)} className="mb-2 flex-row items-center rounded-xl border border-[#D5E0EC] bg-white p-3 dark:border-[#252D3C] dark:bg-[#111420]"><FotoArtista url={artista.fotoURL} style={{ width: 48, height: 48, borderRadius: 24 }} /><Text className="ml-3 text-sm text-[#142338] dark:text-white">{artista.nome}</Text></Pressable>)}
                        </>
                    )}
                </View>
            ) : <>
                <View className="mx-4 mt-4 overflow-hidden rounded-3xl border border-[#B9A1FF]/40 bg-[#111420] py-4 shadow-lg shadow-[#8B6DFF]/20">
                    <View className="mx-5 mb-3 flex-row items-center justify-between">
                        <View className="flex-1 pr-3">
                            <Text className="text-[10px] font-bold tracking-[2px] text-[#B9A1FF]">EXPERIÊNCIAS MARÉ</Text>
                            <Text className="mt-1 font-serif text-xl text-white">Escolha por onde explorar</Text>
                            <Text className="mt-1 text-xs leading-4 text-[#CFD4E2]">Encontre uma música de um jeito diferente.</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        <AtalhoMusicalCard
                            tipo="roleta"
                            imagem={imagensPersonalizadas[2]?.capa ?? imagensCatalogoEmbaralhadas[2]?.capa}
                        />
                        <AtalhoMusicalCard
                            tipo="duelo"
                            imagem={imagensCatalogoEmbaralhadas[3]?.capa}
                        />
                        <AtalhoMusicalCard
                            tipo="momento"
                            imagem={imagensPersonalizadas[3]?.capa ?? imagensCatalogoEmbaralhadas[4]?.capa}
                        />
                        <AtalhoMusicalCard
                            tipo="bingo"
                            imagem={artistasPersonalizadosEmbaralhados[1]?.fotoURL ?? imagensCatalogoEmbaralhadas[5]?.capa}
                        />
                    </ScrollView>
                </View>
                <View className="mt-6">
                    <Text className="text-[#142338] dark:text-white text-lg font-serif mx-6 mb-3">Mais para explorar</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                        <AtalhoMusicalCard tipo="descoberta" imagem={imagensPersonalizadas[0]?.capa ?? imagensCatalogoEmbaralhadas[0]?.capa} />
                        <AtalhoMusicalCard tipo="universo" imagem={artistasPersonalizadosEmbaralhados[0]?.fotoURL ?? imagensPersonalizadas[1]?.capa ?? imagensCatalogoEmbaralhadas[1]?.capa} />
                    </ScrollView>
                </View>
                <SecaoMusicas titulo="Em alta" lista={emAlta} tipo="banner" carregando={carregando} />
                <SecaoMusicas titulo="Mais bem avaliadas" lista={bemAvaliadas} tipo="quadrado" carregando={carregando} />
                {secoesRecomendadas.length ? (
                    secoesRecomendadas.map((secao, indice) => (
                        <SecaoMusicas
                            key={`${secao.titulo}-${indice}`}
                            titulo={secao.titulo}
                            lista={secao.musicas}
                            tipo="quadrado"
                            carregando={carregando}
                        />
                    ))
                ) : (
                    <SecaoMusicas
                        titulo="Do catálogo Maré"
                        lista={recomendadas.length ? recomendadas : musicasFiltradas.slice(0, 8)}
                        tipo="quadrado"
                        carregando={carregando}
                    />
                )}
                <View className="mt-7"><Text className="text-[#142338] dark:text-white text-lg font-serif mx-6 mb-3">Artistas</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
                    {artistasFiltrados.slice(0, 12).map((a) => <Pressable key={a.id} onPress={() => router.push(`/artista/${a.id}` as never)} className="w-[104px] items-center mr-4"><FotoArtista url={a.fotoURL} style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: "#171E2B" }} /><Text className="text-[#142338] dark:text-white text-xs text-center mt-2" numberOfLines={1}>{a.nome}</Text></Pressable>)}
                </ScrollView></View>
                <View className="mt-7"><Text className="text-[#142338] dark:text-white text-lg font-serif mx-6 mb-2">Publicações recentes</Text>{postsRecentes.length ? postsRecentes.map((p) => p.musica && <PostCard key={p.id} postId={p.id} name={p.usuario?.nome} username={p.usuario?.username} foto={p.usuario?.foto} time={p.dataCriacao} content={p.texto} nota={p.nota} editado={p.editado} musicId={p.musica.id} musicTitle={p.musica.titulo} artist={p.musica.artista?.nome} artistId={p.musica.artista?.id} musicCover={p.musica.capa} duracaoSegundos={p.musica.duracaoSegundos} likes={p._count?.curtidas} comments={p._count?.comentarios} curtidoPorMim={p.curtidoPorMim} ehMeuPost={p.usuario?.id === usuarioLogadoId} />) : <Text className="text-[#52677F] dark:text-[#718096] text-sm mx-6">Nenhuma publicação encontrada.</Text>}</View>
            </>}
            <View className="h-6" />
        </ScrollView>}
        <Navbar />
    </SafeAreaView>;
}

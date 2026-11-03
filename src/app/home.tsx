import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import FeedTabs from "../components/FeedTabs";
import Navbar from "../components/navbar";
import PostCard from "../components/postCard";
import MusicaDoDiaCard from "../components/MusicaDoDiaCard";
import Searchbar from "../components/searchBar";
import Topbar from "../components/topbar";
import { buscarMusicaDoDia, type MusicaDoDia } from "../services/recomendacaoService";
import { buscarPosts as buscarPublicacoes, type Post } from "../services/postService";
import { registrarPesquisa } from "../services/historicoPesquisaService";
import { buscarMeuPerfil } from "../services/usuarioService";
import { atualizarWidgetMusicaDoDia } from "../services/widgetMusicaDoDiaService";

type AbaFeed = "paraVoce" | "seguindo";

export default function Home() {
    const router = useRouter();
    const [abaAtiva, setAbaAtiva] = useState<AbaFeed>("paraVoce");
    const [termoBusca, setTermoBusca] = useState("");
    const [publicacoesRecomendadas, setPublicacoesRecomendadas] = useState<Post[]>([]);
    const [publicacoesSeguindo, setPublicacoesSeguindo] = useState<Post[]>([]);
    const [usuarioId, setUsuarioId] = useState<number | null>(null);
    const [musicaDoDia, setMusicaDoDia] = useState<MusicaDoDia["musica"]>(null);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const idSolicitacao = useRef(0);

    useEffect(() => {
        let ativo = true;
        void buscarMeuPerfil()
            .then((usuario) => {
                if (ativo) setUsuarioId(usuario.id);
            })
            .catch((erroUsuario) => console.error("Erro ao buscar o perfil do usuário:", erroUsuario));

        return () => {
            ativo = false;
        };
    }, []);

    // Recomendação diária chega pequena e não bloqueia a abertura do feed.
    useEffect(() => {
        let ativo = true;

        void buscarMusicaDoDia()
            .then((resposta) => {
                if (ativo) {
                    setMusicaDoDia(resposta.musica);
                    void atualizarWidgetMusicaDoDia(resposta.musica).catch((erroWidget) => {
                        console.warn("Não foi possível atualizar o widget da Maré:", erroWidget);
                    });
                }
            })
            .catch((erroRecomendacao) => {
                console.error("Erro ao buscar a música do dia:", erroRecomendacao);
            });

        return () => {
            ativo = false;
        };
    }, []);

    // Carrega a lista certa e ignora respostas antigas se a aba mudar no meio da busca.
    const carregarPublicacoes = useCallback(
        async (aba: AbaFeed, atualizacaoManual = false) => {
            const solicitacaoAtual = ++idSolicitacao.current;

            if (atualizacaoManual) {
                setAtualizando(true);
            } else {
                setCarregando(true);
            }
            setErro("");

            try {
                const publicacoes = await buscarPublicacoes(
                    aba === "seguindo" ? "/posts?seguindo=true" : "/posts",
                );

                if (solicitacaoAtual !== idSolicitacao.current) return;

                if (aba === "seguindo") {
                    setPublicacoesSeguindo(publicacoes);
                } else {
                    setPublicacoesRecomendadas(publicacoes);
                }
            } catch (erroCarregamento) {
                if (solicitacaoAtual !== idSolicitacao.current) return;

                console.error("Erro ao carregar as publicações:", erroCarregamento);
                setErro(
                    aba === "seguindo"
                        ? "Não foi possível carregar as publicações de quem você segue."
                        : "Não foi possível carregar as publicações.",
                );
            } finally {
                if (solicitacaoAtual === idSolicitacao.current) {
                    setCarregando(false);
                    setAtualizando(false);
                }
            }
        },
        [],
    );

    useEffect(() => {
        void carregarPublicacoes(abaAtiva);
    }, [abaAtiva, carregarPublicacoes]);

    const publicacoesExibidas =
        abaAtiva === "seguindo"
            ? publicacoesSeguindo
            : publicacoesRecomendadas;

    function pesquisar(consulta: string) {
        const termo = consulta.trim();
        if (!termo) return;

        void registrarPesquisa(termo).catch((erroBusca) => {
            console.warn("Não foi possível salvar a pesquisa no histórico.", erroBusca);
        });
        router.push({ pathname: "/explorar", params: { q: termo } } as never);
    }

    function removerPublicacao(id: number) {
        setPublicacoesRecomendadas((lista) =>
            lista.filter((publicacao) => publicacao.id !== id),
        );
        setPublicacoesSeguindo((lista) =>
            lista.filter((publicacao) => publicacao.id !== id),
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar />
            <Searchbar value={termoBusca} onChangeText={setTermoBusca} onSubmitEditing={pesquisar} />

            {/* Alterna entre recomendações e publicações de quem você segue. */}
            <FeedTabs
                abaAtiva={abaAtiva}
                setAbaAtiva={setAbaAtiva}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={atualizando}
                        onRefresh={() => void carregarPublicacoes(abaAtiva, true)}
                        tintColor="#5EA7ED"
                        colors={["#5EA7ED"]}
                    />
                }
            >
                {musicaDoDia ? (
                    <>
                        <Text className="mx-5 mb-2 mt-4 font-serif text-lg text-white">Música do dia</Text>
                        <MusicaDoDiaCard musica={musicaDoDia} />
                        <View className="mx-5 mb-4 mt-1 flex-row items-center">
                            <View className="h-px flex-1 bg-[#252D3C]" />
                            <Text className="mx-3 text-[10px] font-semibold uppercase tracking-[1.4px] text-[#718096]">
                                Publicações
                            </Text>
                            <View className="h-px flex-1 bg-[#252D3C]" />
                        </View>
                    </>
                ) : null}

                <View className="flex-1">
                    {carregando ? (
                        <View className="py-12 items-center">
                            <ActivityIndicator size="large" color="#5EA7ED" />
                            <Text className="text-[#718096] text-sm mt-3">
                                Carregando publicações...
                            </Text>
                        </View>
                    ) : erro ? (
                        <View className="px-6 py-12 items-center">
                            <Text className="text-red-400 text-sm text-center">
                                {erro}
                            </Text>
                        </View>
                    ) : publicacoesExibidas.length > 0 ? (
                        publicacoesExibidas.map((publicacao) => (
                            <PostCard
                                key={publicacao.id}
                                postId={publicacao.id}
                                name={publicacao.usuario?.nome ?? "Usuário"}
                                username={publicacao.usuario?.username ?? ""}
                                foto={publicacao.usuario?.foto}
                                time={publicacao.dataCriacao}
                                content={publicacao.texto ?? ""}
                                musicId={publicacao.musica?.id ?? 0}
                                musicTitle={
                                    publicacao.musica?.titulo ?? "Música indisponível"
                                }
                                artist={
                                    publicacao.musica?.artista?.nome ??
                                    "Artista desconhecido"
                                }
                                artistId={publicacao.musica?.artista?.id}
                                musicCover={publicacao.musica?.capa}
                                nota={publicacao.nota}
                                editado={publicacao.editado}
                                avaliacoes={publicacao.musica?.avaliacoes}
                                likes={publicacao._count?.curtidas ?? 0}
                                comments={publicacao._count?.comentarios ?? 0}
                                curtidoPorMim={publicacao.curtidoPorMim ?? false}
                                duracaoSegundos={
                                    publicacao.musica?.duracaoSegundos
                                }
                                ehMeuPost={
                                    usuarioId !== null && publicacao.usuario?.id === usuarioId
                                }
                                onExcluir={() => removerPublicacao(publicacao.id)}
                            />
                        ))
                    ) : (
                        <View className="px-6 py-12 items-center">
                            <Text className="text-white text-base font-semibold text-center">
                                {abaAtiva === "seguindo"
                                    ? "Nenhuma publicação de quem você segue."
                                    : "Nenhuma publicação por enquanto."}
                            </Text>
                            <Text className="text-[#718096] text-sm text-center mt-2">
                                Volte mais tarde para descobrir novas avaliações musicais.
                            </Text>
                        </View>
                    )}
                </View>

                <View className="h-8" />
            </ScrollView>

            {/* Navegação principal do aplicativo. */}
            <Navbar />
        </SafeAreaView>
    );
}

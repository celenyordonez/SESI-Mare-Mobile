import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FeedTabs from "../components/FeedTabs";
import Navbar from "../components/navbar";
import PostCard from "../components/postCard";
import Topbar from "../components/topbar";
import { buscarPosts as buscarPublicacoes, type Post } from "../services/postService";
import { buscarMeuPerfil } from "../services/usuarioService";

type AbaFeed = "paraVoce" | "seguindo";
type UsuarioLogado = { id: number; nome: string; username: string };

export default function Home() {
    const [abaAtiva, setAbaAtiva] = useState<AbaFeed>("paraVoce");
    const [publicacoesRecomendadas, setPublicacoesRecomendadas] = useState<Post[]>([]);
    const [publicacoesSeguindo, setPublicacoesSeguindo] = useState<Post[]>([]);
    const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const idSolicitacao = useRef(0);

    // Busca o perfil para exibir o nome da pessoa no cabeçalho.
    useEffect(() => {
        let ativo = true;

        async function carregarUsuario() {
            try {
                const usuario = await buscarMeuPerfil();
                if (ativo) {
                    setUsuarioLogado({
                        id: usuario.id,
                        nome: usuario.nome,
                        username: usuario.username,
                    });
                }
            } catch (erroUsuario) {
                console.error("Erro ao buscar o perfil do usuário:", erroUsuario);
            }
        }

        void carregarUsuario();
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
            {/* Cabeçalho com o nome da pessoa conectada. */}
            <Topbar
                titulo={`Olá, ${usuarioLogado?.nome ?? usuarioLogado?.username ?? "Usuário"}`}
                subtitulo="O que você quer descobrir hoje?"
            />

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
                <View className="flex-1 mt-2">
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
                                    usuarioLogado !== null &&
                                    publicacao.usuario?.id === usuarioLogado.id
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

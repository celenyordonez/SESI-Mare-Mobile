import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ChatCircleIcon,
    HeartIcon,
    PaperPlaneTiltIcon,
    PencilSimpleIcon,
    TrashIcon,
    UserIcon,
} from "phosphor-react-native";

import PostCard from "../../components/postCard";
import Topbar from "../../components/topbar";
import {
    alternarCurtidaComentario as alternarCurtidaComentarioApi,
    buscarComentarios,
    criarComentario as criarComentarioApi,
    editarComentario,
    excluirComentario as excluirComentarioApi,
    type Comentario,
} from "../../services/comentarioService";
import { buscarPostPorId, type Post } from "../../services/postService";
import { buscarMeuPerfil } from "../../services/usuarioService";

type UsuarioLogado = { id: number; foto?: string | null };
type ComentarioComProfundidade = { comentario: Comentario; profundidade: number };

// Transforma comentários e respostas em uma lista para calcular o total exibido.
function achatarComentarios(
    comentarios: Comentario[],
    profundidade = 0,
): ComentarioComProfundidade[] {
    return comentarios.flatMap((comentario) => [
        { comentario, profundidade },
        ...achatarComentarios(comentario.respostas ?? [], profundidade + 1),
    ]);
}

export default function DetalhePublicacao() {
    const { id: idParametro } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const idPublicacao = Number(idParametro);

    const [publicacao, setPublicacao] = useState<Post | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
    const [textoComentario, setTextoComentario] = useState("");
    const [respondendoAId, setRespondendoAId] = useState<number | null>(null);
    const [comentarioEmEdicaoId, setComentarioEmEdicaoId] = useState<number | null>(null);
    const [textoEmEdicao, setTextoEmEdicao] = useState("");
    const [curtidasEmAtualizacao, setCurtidasEmAtualizacao] = useState<Set<number>>(
        new Set(),
    );
    const idsCurtidosEmAtualizacao = useRef(new Set<number>());
    const [carregando, setCarregando] = useState(true);
    const [enviandoComentario, setEnviandoComentario] = useState(false);
    const [erro, setErro] = useState("");

    // Busca a publicação, os comentários e o perfil em paralelo.
    useEffect(() => {
        let ativo = true;

        async function carregarPublicacao() {
            if (!Number.isInteger(idPublicacao) || idPublicacao < 1) {
                setErro("Publicação não encontrada.");
                setCarregando(false);
                return;
            }

            setCarregando(true);

            try {
                const [dadosPublicacao, dadosComentarios, dadosUsuario] =
                    await Promise.all([
                        buscarPostPorId(idPublicacao),
                        buscarComentarios(idPublicacao),
                        buscarMeuPerfil().catch(() => null),
                    ]);

                if (!ativo) return;

                setPublicacao(dadosPublicacao);
                setComentarios(dadosComentarios);
                setUsuarioLogado(dadosUsuario);
                setErro("");
            } catch (erroCarregamento) {
                if (!ativo) return;

                setErro(
                    erroCarregamento instanceof Error
                        ? erroCarregamento.message
                        : "Não foi possível carregar a publicação.",
                );
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarPublicacao();
        return () => {
            ativo = false;
        };
    }, [idPublicacao]);

    const totalComentarios = useMemo(
        () => achatarComentarios(comentarios).length,
        [comentarios],
    );

    function inserirComentarioNaLista(
        comentarioPaiId: number | null,
        novoComentario: Comentario,
    ) {
        if (comentarioPaiId == null) {
            setComentarios((atuais) => [...atuais, novoComentario]);
            return;
        }

        function inserirNaArvore(lista: Comentario[]): Comentario[] {
            return lista.map((comentario) =>
                comentario.id === comentarioPaiId
                    ? {
                          ...comentario,
                          respostas: [
                              ...(comentario.respostas ?? []),
                              novoComentario,
                          ],
                      }
                    : {
                          ...comentario,
                          respostas: inserirNaArvore(comentario.respostas ?? []),
                      },
            );
        }

        setComentarios((atuais) => inserirNaArvore(atuais));
    }

    async function enviarComentario() {
        const texto = textoComentario.trim();
        if (!texto || enviandoComentario) return;

        setEnviandoComentario(true);

        try {
            const novoComentario = await criarComentarioApi(
                idPublicacao,
                texto,
                respondendoAId ?? undefined,
            );

            inserirComentarioNaLista(respondendoAId, {
                ...novoComentario,
                respostas: [],
            });
            setPublicacao((atual) =>
                atual
                    ? {
                          ...atual,
                          _count: {
                              curtidas: atual._count?.curtidas ?? 0,
                              comentarios:
                                  (atual._count?.comentarios ?? totalComentarios) + 1,
                          },
                      }
                    : atual,
            );
            setTextoComentario("");
            setRespondendoAId(null);
        } catch (erroEnvio) {
            Alert.alert(
                "Não foi possível enviar o comentário",
                erroEnvio instanceof Error ? erroEnvio.message : "Tente novamente.",
            );
        } finally {
            setEnviandoComentario(false);
        }
    }

    async function alternarCurtida(comentario: Comentario) {
        if (idsCurtidosEmAtualizacao.current.has(comentario.id)) return;

        idsCurtidosEmAtualizacao.current.add(comentario.id);
        setCurtidasEmAtualizacao(new Set(idsCurtidosEmAtualizacao.current));

        const jaCurtido = comentario.curtidoPorMim ?? false;

        function atualizarCurtida(lista: Comentario[], novoEstado: boolean): Comentario[] {
            return lista.map((item) =>
                item.id === comentario.id
                    ? {
                          ...item,
                          curtidoPorMim: novoEstado,
                          _count: {
                              curtidas: Math.max(
                                  0,
                                  (item._count?.curtidas ?? 0) +
                                      (novoEstado ? 1 : -1),
                              ),
                          },
                      }
                    : {
                          ...item,
                          respostas: atualizarCurtida(
                              item.respostas ?? [],
                              novoEstado,
                          ),
                      },
            );
        }

        setComentarios((atuais) => atualizarCurtida(atuais, !jaCurtido));

        try {
            await alternarCurtidaComentarioApi(comentario.id, jaCurtido);
        } catch (erroCurtida) {
            setComentarios((atuais) => atualizarCurtida(atuais, jaCurtido));
            Alert.alert(
                "Não foi possível atualizar a curtida",
                erroCurtida instanceof Error
                    ? erroCurtida.message
                    : "Tente novamente.",
            );
        } finally {
            idsCurtidosEmAtualizacao.current.delete(comentario.id);
            setCurtidasEmAtualizacao(new Set(idsCurtidosEmAtualizacao.current));
        }
    }

    async function salvarEdicaoComentario(comentarioId: number) {
        const texto = textoEmEdicao.trim();
        if (!texto || texto.length > 500) return;

        try {
            await editarComentario(comentarioId, texto);

            function atualizarTexto(lista: Comentario[]): Comentario[] {
                return lista.map((comentario) =>
                    comentario.id === comentarioId
                        ? { ...comentario, texto, editado: true }
                        : {
                              ...comentario,
                              respostas: atualizarTexto(comentario.respostas ?? []),
                          },
                );
            }

            setComentarios((atuais) => atualizarTexto(atuais));
            setComentarioEmEdicaoId(null);
            setTextoEmEdicao("");
        } catch (erroEdicao) {
            Alert.alert(
                "Não foi possível editar o comentário",
                erroEdicao instanceof Error ? erroEdicao.message : "Tente novamente.",
            );
        }
    }

    function confirmarExclusaoComentario(comentario: Comentario) {
        Alert.alert(
            "Excluir comentário?",
            "Essa ação não poderá ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => {
                        void excluirComentarioDaLista(comentario);
                    },
                },
            ],
        );
    }

    async function excluirComentarioDaLista(comentario: Comentario) {
        try {
            await excluirComentarioApi(comentario.id);

            function removerDaArvore(lista: Comentario[]): Comentario[] {
                return lista
                    .filter((item) => item.id !== comentario.id)
                    .map((item) => ({
                        ...item,
                        respostas: removerDaArvore(item.respostas ?? []),
                    }));
            }

            const quantidadeRemovida = achatarComentarios([comentario]).length;
            setComentarios((atuais) => removerDaArvore(atuais));
            setPublicacao((atual) =>
                atual
                    ? {
                          ...atual,
                          _count: {
                              curtidas: atual._count?.curtidas ?? 0,
                              comentarios: Math.max(
                                  0,
                                  (atual._count?.comentarios ?? totalComentarios) -
                                      quantidadeRemovida,
                              ),
                          },
                      }
                    : atual,
            );
        } catch (erroExclusao) {
            Alert.alert(
                "Não foi possível excluir o comentário",
                erroExclusao instanceof Error
                    ? erroExclusao.message
                    : "Tente novamente.",
            );
        }
    }

    function renderizarComentario(comentario: Comentario, profundidade: number) {
        return (
            <View
                key={comentario.id}
                className="border-b border-[#202633] py-4"
                style={{ marginLeft: Math.min(profundidade, 3) * 16 }}
            >
                <View className="flex-row items-start">
                    {comentario.usuario.foto ? (
                        <Image
                            source={{ uri: comentario.usuario.foto }}
                            className="w-9 h-9 rounded-full"
                        />
                    ) : (
                        <View className="w-9 h-9 rounded-full bg-[#171E2B] items-center justify-center">
                            <UserIcon size={19} color="#9AA6BA" />
                        </View>
                    )}

                    <View className="flex-1 ml-3">
                        <View className="flex-row items-center">
                            <Text className="text-white text-sm font-semibold">
                                {comentario.usuario.nome}
                            </Text>
                            {comentario.usuario.username ? (
                                <Text className="text-[#718096] text-xs ml-2">
                                    @{comentario.usuario.username}
                                </Text>
                            ) : null}
                        </View>

                        {comentarioEmEdicaoId === comentario.id ? (
                            <>
                                <TextInput
                                    className="text-white text-sm border border-[#354052] rounded-lg p-3 mt-2"
                                    value={textoEmEdicao}
                                    onChangeText={setTextoEmEdicao}
                                    multiline
                                    maxLength={500}
                                />
                                <View className="flex-row mt-2">
                                    <Pressable
                                        onPress={() => setComentarioEmEdicaoId(null)}
                                        className="mr-4"
                                    >
                                        <Text className="text-[#9AA6BA] text-xs">
                                            Cancelar
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() =>
                                            void salvarEdicaoComentario(comentario.id)
                                        }
                                    >
                                        <Text className="text-[#58AAF0] text-xs">
                                            Salvar
                                        </Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <Text className="text-[#D0D0D5] text-sm leading-5 mt-1">
                                {comentario.texto}
                                {comentario.editado ? " · editado" : ""}
                            </Text>
                        )}

                        <View className="flex-row items-center mt-3">
                            <Pressable
                                onPress={() => void alternarCurtida(comentario)}
                                disabled={curtidasEmAtualizacao.has(comentario.id)}
                                className="flex-row items-center mr-5"
                            >
                                <HeartIcon
                                    size={17}
                                    color={
                                        comentario.curtidoPorMim
                                            ? "#EC4899"
                                            : "#8A96A8"
                                    }
                                    weight={
                                        comentario.curtidoPorMim ? "fill" : "regular"
                                    }
                                />
                                <Text className="text-[#8A96A8] text-xs ml-1">
                                    {comentario._count?.curtidas ?? 0}
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    setRespondendoAId(comentario.id);
                                    setTextoComentario("");
                                }}
                            >
                                <Text className="text-[#58AAF0] text-xs">
                                    Responder
                                </Text>
                            </Pressable>

                            {comentario.usuario.id === usuarioLogado?.id ? (
                                <>
                                    <Pressable
                                        onPress={() => {
                                            setComentarioEmEdicaoId(comentario.id);
                                            setTextoEmEdicao(comentario.texto);
                                        }}
                                        className="ml-auto mr-4"
                                    >
                                        <PencilSimpleIcon size={16} color="#9AA6BA" />
                                    </Pressable>
                                    <Pressable
                                        onPress={() =>
                                            confirmarExclusaoComentario(comentario)
                                        }
                                    >
                                        <TrashIcon size={17} color="#F87171" />
                                    </Pressable>
                                </>
                            ) : null}
                        </View>
                    </View>
                </View>

                {(comentario.respostas ?? []).map((resposta) =>
                    renderizarComentario(resposta, profundidade + 1),
                )}
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar
                titulo="Publicação"
                subtitulo={
                    publicacao
                        ? `${totalComentarios} comentários`
                        : "Detalhes e comentários"
                }
                tipo="voltar"
            />

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#5EA7ED" />
                </View>
            ) : !publicacao ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-400 text-sm text-center">
                        {erro || "Publicação não encontrada."}
                    </Text>
                    <Pressable onPress={() => roteador.back()} className="mt-4">
                        <Text className="text-[#58AAF0]">Voltar</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {publicacao.musica ? (
                        <PostCard
                            postId={publicacao.id}
                            name={publicacao.usuario?.nome}
                            username={publicacao.usuario?.username}
                            foto={publicacao.usuario?.foto}
                            time={publicacao.dataCriacao}
                            content={publicacao.texto}
                            nota={publicacao.nota}
                            editado={publicacao.editado}
                            musicId={publicacao.musica.id}
                            musicTitle={publicacao.musica.titulo}
                            artist={publicacao.musica.artista?.nome}
                            artistId={publicacao.musica.artista?.id}
                            musicCover={publicacao.musica.capa}
                            duracaoSegundos={publicacao.musica.duracaoSegundos}
                            likes={publicacao._count?.curtidas}
                            comments={publicacao._count?.comentarios}
                            curtidoPorMim={publicacao.curtidoPorMim}
                            ehMeuPost={publicacao.usuario?.id === usuarioLogado?.id}
                            onExcluir={() => roteador.back()}
                        />
                    ) : null}

                    <View className="px-5 mt-3">
                        <Text className="text-white text-base font-semibold">
                            Comentários ({totalComentarios})
                        </Text>

                        {respondendoAId !== null ? (
                            <View className="flex-row items-center mt-3">
                                <Text className="text-[#58AAF0] text-xs flex-1">
                                    Respondendo a um comentário
                                </Text>
                                <Pressable onPress={() => setRespondendoAId(null)}>
                                    <Text className="text-[#9AA6BA] text-xs">
                                        Cancelar
                                    </Text>
                                </Pressable>
                            </View>
                        ) : null}

                        <View className="flex-row items-end mt-3 mb-2">
                            <TextInput
                                className="flex-1 min-h-[46px] max-h-[120px] bg-[#111420] border border-[#354052] rounded-xl px-3 py-3 text-white text-sm"
                                value={textoComentario}
                                onChangeText={setTextoComentario}
                                placeholder={
                                    respondendoAId === null
                                        ? "Escreva um comentário..."
                                        : "Escreva sua resposta..."
                                }
                                placeholderTextColor="#718096"
                                multiline
                                maxLength={500}
                            />
                            <Pressable
                                onPress={() => void enviarComentario()}
                                disabled={
                                    enviandoComentario || !textoComentario.trim()
                                }
                                className="ml-2 w-11 h-11 rounded-xl bg-[#58AAF0] items-center justify-center"
                            >
                                <PaperPlaneTiltIcon size={20} color="#FFFFFF" />
                            </Pressable>
                        </View>

                        {comentarios.length > 0 ? (
                            comentarios.map((comentario) =>
                                renderizarComentario(comentario, 0),
                            )
                        ) : (
                            <Text className="text-[#718096] text-sm text-center py-8">
                                Ainda não há comentários.
                            </Text>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

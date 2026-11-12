import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    findNodeHandle,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
    type ScrollViewInstance,
    type TextInputInstance,
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
import { buscarMeuPerfil, buscarUsuarios, type UsuarioBusca } from "../../services/usuarioService";

type UsuarioLogado = { id: number; foto?: string | null };
type ComentarioComProfundidade = { comentario: Comentario; profundidade: number; pai?: Comentario };

// Mantém a ordem da conversa sem aninhar as caixas visuais de resposta.
function achatarComentarios(
    comentarios: Comentario[],
    profundidade = 0,
    pai?: Comentario,
): ComentarioComProfundidade[] {
    return comentarios.flatMap((comentario) => [
        { comentario, profundidade, pai },
        ...achatarComentarios(comentario.respostas ?? [], profundidade + 1, comentario),
    ]);
}

function formatarDataComentario(dataIso: string) {
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime())) return "";
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const mesmaData = (a: Date, b: Date) => a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
    const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    if (mesmaData(data, hoje)) return `Hoje às ${hora}`;
    if (mesmaData(data, ontem)) return `Ontem às ${hora}`;
    const dia = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        ...(data.getFullYear() !== hoje.getFullYear() ? { year: "numeric" as const } : {}),
    });
    return `${dia} às ${hora}`;
}

export default function DetalhePublicacao() {
    const { id: idParametro } = useLocalSearchParams<{ id: string }>();
    const roteador = useRouter();
    const scrollRef = useRef<ScrollViewInstance | null>(null);
    const campoComentarioRef = useRef<TextInputInstance | null>(null);
    const idPublicacao = Number(idParametro);

    const [publicacao, setPublicacao] = useState<Post | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null);
    const [textoComentario, setTextoComentario] = useState("");
    const [termoMencao, setTermoMencao] = useState<string | null>(null);
    const [usuariosSugeridos, setUsuariosSugeridos] = useState<UsuarioBusca[]>([]);
    const [carregandoMencoes, setCarregandoMencoes] = useState(false);
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

    const rolarCampoComentarioParaVisivel = useCallback(() => {
        requestAnimationFrame(() => {
            const identificador = findNodeHandle(campoComentarioRef.current);
            if (identificador != null) {
                scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
                    identificador,
                    100,
                    true,
                );
            }
        });
    }, []);

    // Ao iniciar uma resposta, abre o campo junto ao comentário selecionado.
    useEffect(() => {
        if (respondendoAId === null) return;
        requestAnimationFrame(() => {
            campoComentarioRef.current?.focus();
            rolarCampoComentarioParaVisivel();
        });
    }, [respondendoAId, rolarCampoComentarioParaVisivel]);

    useEffect(() => {
        if (!termoMencao) {
            setUsuariosSugeridos([]);
            setCarregandoMencoes(false);
            return;
        }

        let ativo = true;
        const temporizador = setTimeout(() => {
            setCarregandoMencoes(true);
            void buscarUsuarios(termoMencao)
                .then((usuarios) => { if (ativo) setUsuariosSugeridos(usuarios); })
                .catch(() => { if (ativo) setUsuariosSugeridos([]); })
                .finally(() => { if (ativo) setCarregandoMencoes(false); });
        }, 250);

        return () => {
            ativo = false;
            clearTimeout(temporizador);
        };
    }, [termoMencao]);

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

    function buscarComentarioNaArvore(id: number, lista = comentarios): Comentario | undefined {
        for (const comentario of lista) {
            if (comentario.id === id) return comentario;
            const resposta = buscarComentarioNaArvore(id, comentario.respostas ?? []);
            if (resposta) return resposta;
        }
        return undefined;
    }

    function atualizarTextoComMencao(texto: string) {
        setTextoComentario(texto);
        const ocorrencia = texto.match(/(?:^|\s)@([A-Za-z0-9._]{1,30})$/);
        setTermoMencao(ocorrencia?.[1] ?? null);
    }

    function selecionarMencao(usuario: UsuarioBusca) {
        setTextoComentario((atual) => atual.replace(/(^|\s)@[A-Za-z0-9._]*$/, (_correspondencia, espaco: string) => `${espaco}@${usuario.username} `));
        setTermoMencao(null);
        setUsuariosSugeridos([]);
    }

    function renderizarCampoComentario() {
        const comentarioPai = respondendoAId === null
            ? undefined
            : buscarComentarioNaArvore(respondendoAId);

        return (
            <View className="mt-3 mb-2">
                {comentarioPai ? (
                    <View className="mb-2 flex-row items-center">
                        <Text className="flex-1 text-xs text-[#155B91] dark:text-[#58AAF0]">
                            Respondendo a @{comentarioPai.usuario.username || comentarioPai.usuario.nome}
                        </Text>
                        <Pressable
                            onPress={() => {
                                setRespondendoAId(null);
                                setTextoComentario("");
                                setTermoMencao(null);
                                Keyboard.dismiss();
                            }}
                            accessibilityRole="button"
                        >
                            <Text className="px-2 py-1 text-xs text-[#52677F] dark:text-[#9AA6BA]">Cancelar</Text>
                        </Pressable>
                    </View>
                ) : null}

                <View className="flex-row items-end">
                    <TextInput
                        ref={campoComentarioRef}
                        className="min-h-[46px] max-h-[120px] flex-1 rounded-xl border border-[#C5D3E1] bg-white px-3 py-3 text-sm text-[#142338] dark:border-[#354052] dark:bg-[#111420] dark:text-white"
                        value={textoComentario}
                        onChangeText={atualizarTextoComMencao}
                        onFocus={rolarCampoComentarioParaVisivel}
                        placeholder={comentarioPai ? "Escreva sua resposta..." : "Escreva um comentário..."}
                        placeholderTextColor="#718096"
                        multiline
                        maxLength={500}
                    />
                    <Pressable
                        onPress={() => void enviarComentario()}
                        disabled={enviandoComentario || !textoComentario.trim()}
                        accessibilityRole="button"
                        accessibilityLabel={comentarioPai ? "Enviar resposta" : "Enviar comentário"}
                        className="ml-2 h-11 w-11 items-center justify-center rounded-xl bg-[#58AAF0]"
                        style={{ opacity: enviandoComentario || !textoComentario.trim() ? 0.45 : 1 }}
                    >
                        <PaperPlaneTiltIcon size={20} color="#FFFFFF" />
                    </Pressable>
                </View>

                {termoMencao ? (
                    <View className="mt-2 overflow-hidden rounded-xl border border-[#C5D3E1] bg-white dark:border-[#354052] dark:bg-[#111420]">
                        {carregandoMencoes ? (
                            <ActivityIndicator className="py-3" color="#58AAF0" />
                        ) : usuariosSugeridos.map((usuario) => (
                            <Pressable
                                key={usuario.id}
                                onPress={() => selecionarMencao(usuario)}
                                className="flex-row items-center border-b border-[#E3EBF3] px-3 py-2.5 last:border-b-0 dark:border-[#202633]"
                            >
                                {usuario.foto ? (
                                    <Image source={{ uri: usuario.foto }} className="h-9 w-9 rounded-full" />
                                ) : (
                                    <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DFEAF5] dark:bg-[#171E2B]"><UserIcon size={18} color="#718096" /></View>
                                )}
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{usuario.nome}</Text>
                                    <Text className="text-xs text-[#52677F] dark:text-[#8793A7]" numberOfLines={1}>@{usuario.username}</Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                ) : null}
            </View>
        );
    }

    function renderizarTextoComMencoes(texto: string) {
        return texto.split(/(@[A-Za-z0-9._]+)/g).map((parte, indice) => {
            if (!parte.startsWith("@")) return <Text key={indice}>{parte}</Text>;
            const username = parte.slice(1);
            return (
                <Text
                    key={indice}
                    className="font-medium text-[#155B91] dark:text-[#8CC8FF]"
                    onPress={() => roteador.push(`/u/${encodeURIComponent(username)}` as never)}
                    accessibilityRole="link"
                >
                    {parte}
                </Text>
            );
        });
    }

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

            const pai = respondendoAId === null ? undefined : buscarComentarioNaArvore(respondendoAId);
            inserirComentarioNaLista(respondendoAId, {
                ...novoComentario,
                respondendoA: pai ? { nome: pai.usuario.nome, username: pai.usuario.username } : undefined,
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
            setTermoMencao(null);
            setUsuariosSugeridos([]);
            setRespondendoAId(null);
            Keyboard.dismiss();
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

    function renderizarComentario(comentario: Comentario, profundidade: number, comentarioPai?: Comentario) {
        const usernamePai = comentarioPai?.usuario.username || comentarioPai?.usuario.nome;
        const dataFormatada = formatarDataComentario(comentario.dataCriacao);
        const recuo = Math.min(profundidade, 3) * 12;
        return (
            <View
                key={comentario.id}
                className="border-b border-[#D5E0EC] dark:border-[#202633] py-4"
                style={{ marginLeft: recuo, paddingLeft: profundidade > 0 ? 8 : 0, borderLeftWidth: profundidade > 0 ? 1 : 0, borderLeftColor: "#354052" }}
            >
                <View className="flex-row items-start">
                    {comentario.usuario.foto ? (
                        <Pressable
                            accessibilityRole="link"
                            accessibilityLabel={`Abrir perfil de ${comentario.usuario.nome}`}
                            onPress={() => comentario.usuario.username && roteador.push(`/u/${encodeURIComponent(comentario.usuario.username)}` as never)}
                        >
                        <Image
                            source={{ uri: comentario.usuario.foto }}
                            className="w-9 h-9 rounded-full"
                        />
                        </Pressable>
                    ) : (
                        <View className="w-9 h-9 rounded-full bg-[#F4F7FA] dark:bg-[#171E2B] items-center justify-center">
                            <UserIcon size={19} color="#9AA6BA" />
                        </View>
                    )}

                    <View className="flex-1 ml-3 min-w-0">
                        <View className="flex-row items-center flex-wrap">
                            <Text className="text-[#142338] dark:text-white text-sm font-semibold">
                                {comentario.usuario.nome}
                            </Text>
                            {comentario.usuario.username ? (
                                <Text
                                    className="ml-2 text-xs text-[#52677F] dark:text-[#718096]"
                                    onPress={() => roteador.push(`/u/${encodeURIComponent(comentario.usuario.username!)}` as never)}
                                >
                                    @{comentario.usuario.username}
                                </Text>
                            ) : null}
                            <Text className="ml-2 text-[10px] text-[#52677F] dark:text-[#718096]">{dataFormatada ? `· ${dataFormatada}` : ""}{comentario.editado ? " · editado" : ""}</Text>
                        </View>

                        {comentarioEmEdicaoId === comentario.id ? (
                            <>
                                <TextInput
                                    className="text-[#142338] dark:text-white text-sm border border-[#C5D3E1] dark:border-[#354052] rounded-lg p-3 mt-2"
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
                                        <Text className="text-[#52677F] dark:text-[#9AA6BA] text-xs">
                                            Cancelar
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() =>
                                            void salvarEdicaoComentario(comentario.id)
                                        }
                                    >
                                        <Text className="text-[#155B91] dark:text-[#58AAF0] text-xs">
                                            Salvar
                                        </Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <Text className="mt-1 text-sm leading-5 text-[#405570] dark:text-[#D0D0D5]">
                                {usernamePai ? <Text className="font-medium text-[#155B91] dark:text-[#58AAF0]">@{usernamePai} </Text> : null}
                                {renderizarTextoComMencoes(comentario.texto)}
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
                                    setTermoMencao(null);
                                }}
                            >
                                <Text className="text-[#155B91] dark:text-[#58AAF0] text-xs">
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

                {respondendoAId === comentario.id ? renderizarCampoComentario() : null}

            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar
                titulo="Publicação"
                subtitulo={
                    publicacao
                        ? `${totalComentarios} comentários`
                        : "Detalhes e comentários"
                }
                tipo="voltar"
            />
            <KeyboardAvoidingView className="flex-1" behavior="padding">

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
                        <Text className="text-[#155B91] dark:text-[#58AAF0]">Voltar</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    ref={scrollRef}
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
                        <Text className="text-[#142338] dark:text-white text-base font-semibold">
                            Comentários ({totalComentarios})
                        </Text>

                        {respondendoAId === null ? renderizarCampoComentario() : null}

                        {comentarios.length > 0 ? (
                            achatarComentarios(comentarios).map(({ comentario, profundidade, pai }) =>
                                renderizarComentario(comentario, profundidade, pai),
                            )
                        ) : (
                            <Text className="text-[#52677F] dark:text-[#718096] text-sm text-center py-8">
                                Ainda não há comentários.
                            </Text>
                        )}
                    </View>
                </ScrollView>
            )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

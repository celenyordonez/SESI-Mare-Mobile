import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BellIcon, BellSlashIcon, DotsThreeIcon, LockKeyIcon, MusicNoteIcon, PaperPlaneTiltIcon, ProhibitIcon, XIcon } from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Topbar from "../../components/topbar";
import { buscarMeuPerfil } from "../../services/usuarioService";
import {
    buscarMensagens,
    enviarMensagem,
    compartilharMusica,
    buscarIdsMensagensLidas,
    marcarConversaComoLida,
    buscarDetalhesConversa,
    atualizarConfiguracoesConversa,
    type MensagemPrivada,
} from "../../services/mensagemPrivadaService";
import { buscarMusicas, type Musica } from "../../services/musicaService";
import { feedbackAcao } from "../../services/feedbackTatil";
import { useContadoresNavegacao } from "../../components/ContadoresNavegacao";
import { ApiError } from "../../services/api";
import { ItemMenuAcao, MenuAcoes } from "../../components/MenuAcoes";

const imagemPadrao = require("../../../assets/images/logo.png");

function formatarHora(dataIso: string) {
    const data = new Date(dataIso);
    return Number.isNaN(data.getTime())
        ? ""
        : data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function chaveDoDia(dataIso: string) {
    const data = new Date(dataIso);
    return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
}

function formatarSeparadorDoDia(dataIso: string) {
    const data = new Date(dataIso);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);

    if (chaveDoDia(dataIso) === chaveDoDia(hoje.toISOString())) return "Hoje";
    if (chaveDoDia(dataIso) === chaveDoDia(ontem.toISOString())) return "Ontem";

    const incluirAno = data.getFullYear() !== hoje.getFullYear();
    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        ...(incluirAno ? { year: "numeric" as const } : {}),
    });
}

export default function ConversaPrivada() {
    const router = useRouter();
    const { id: idParam, nome, username, foto } = useLocalSearchParams<{
        id: string;
        nome?: string;
        username?: string;
        foto?: string;
    }>();
    const conversaId = Number(idParam);
    const { atualizarContadores } = useContadoresNavegacao();
    const listaRef = useRef<FlatList<MensagemPrivada> | null>(null);
    const ultimoIdRef = useRef(0);
    const atualizandoRef = useRef(false);
    const [mensagens, setMensagens] = useState<MensagemPrivada[]>([]);
    const [idsMensagensLidas, setIdsMensagensLidas] = useState<Set<number>>(() => new Set());
    const [meuId, setMeuId] = useState<number | null>(null);
    const [texto, setTexto] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");
    const [musicaSilenciada, setMusicaSilenciada] = useState(false);
    const [bloqueadaPorMim, setBloqueadaPorMim] = useState(false);
    const [bloqueadaPeloOutro, setBloqueadaPeloOutro] = useState(false);
    const [opcoesConversaAbertas, setOpcoesConversaAbertas] = useState(false);
    const [seletorMusicaAberto, setSeletorMusicaAberto] = useState(false);
    const [termoMusica, setTermoMusica] = useState("");
    const [resultadosMusica, setResultadosMusica] = useState<Musica[]>([]);
    const [buscandoMusica, setBuscandoMusica] = useState(false);
    const [erroBuscaMusica, setErroBuscaMusica] = useState("");
    const conversaBloqueada = bloqueadaPorMim || bloqueadaPeloOutro;

    useEffect(() => {
        let ativo = true;
        if (!Number.isInteger(conversaId) || conversaId <= 0) {
            setErro("Esta conversa não é válida.");
            setCarregando(false);
            return;
        }

        async function atualizarMensagens(inicial = false) {
            if (atualizandoRef.current) return;
            atualizandoRef.current = true;
            try {
                let novas: MensagemPrivada[];
                let idsLidas: number[] = [];
                let perfil: Awaited<ReturnType<typeof buscarMeuPerfil>> | null = null;
                let conversa: Awaited<ReturnType<typeof buscarDetalhesConversa>> | null = null;

                if (inicial) {
                    [novas, perfil, conversa] = await Promise.all([
                        buscarMensagens(conversaId),
                        buscarMeuPerfil(),
                        buscarDetalhesConversa(conversaId),
                    ]);
                } else {
                    [novas, { ids: idsLidas }] = await Promise.all([
                        buscarMensagens(conversaId, ultimoIdRef.current || undefined),
                        buscarIdsMensagensLidas(conversaId).catch(() => ({ ids: [] })),
                    ]);
                }
                if (!ativo) return;
                if (inicial) {
                    setMensagens(novas);
                    setIdsMensagensLidas(new Set(novas.filter((mensagem) => mensagem.lidaEm).map((mensagem) => mensagem.id)));
                    if (perfil && conversa) {
                        setMeuId(perfil.id);
                        setMusicaSilenciada(conversa.silenciadaPorMim);
                        setBloqueadaPorMim(conversa.bloqueadaPorMim);
                        setBloqueadaPeloOutro(conversa.bloqueadaPeloOutro);
                    }
                } else if (novas.length > 0) {
                    setMensagens((atuais) => {
                        const idsExistentes = new Set(atuais.map((mensagem) => mensagem.id));
                        return [...atuais, ...novas.filter((mensagem) => !idsExistentes.has(mensagem.id))];
                    });
                }
                if (!inicial && idsLidas.length > 0) {
                    setIdsMensagensLidas((atuais) => new Set([...atuais, ...idsLidas]));
                }

                if (ativo) setErro("");
                const ultimo = novas[novas.length - 1];
                if (ultimo) ultimoIdRef.current = Math.max(ultimoIdRef.current, ultimo.id);
                await marcarConversaComoLida(conversaId).catch(() => undefined);
                if (ativo && inicial) void atualizarContadores();
                if (inicial) setCarregando(false);
            } catch (erroBusca) {
                console.error("Erro ao atualizar mensagens privadas:", erroBusca);
                if (ativo) setErro("Não foi possível carregar esta conversa.");
                if (inicial && ativo) setCarregando(false);
            } finally {
                atualizandoRef.current = false;
            }
        }

        void atualizarMensagens(true);
        const intervalo = setInterval(() => { void atualizarMensagens(); }, 5000);
        return () => {
            ativo = false;
            clearInterval(intervalo);
        };
    }, [conversaId, atualizarContadores]);

    useEffect(() => {
        if (!seletorMusicaAberto) return;
        const termo = termoMusica.trim();
        if (termo.length < 2) {
            setResultadosMusica([]);
            setBuscandoMusica(false);
            setErroBuscaMusica("");
            return;
        }

        let ativo = true;
        setResultadosMusica([]);
        setErroBuscaMusica("");
        const temporizador = setTimeout(() => {
            setBuscandoMusica(true);
            void buscarMusicas(termo)
                .then((musicas) => { if (ativo) setResultadosMusica(musicas); })
                .catch((erroBusca) => {
                    console.error("Erro ao pesquisar músicas para compartilhar no chat:", erroBusca);
                    if (ativo) {
                        setResultadosMusica([]);
                        setErroBuscaMusica("Não foi possível buscar músicas. Confira sua conexão e tente novamente.");
                    }
                })
                .finally(() => { if (ativo) setBuscandoMusica(false); });
        }, 300);

        return () => {
            ativo = false;
            clearTimeout(temporizador);
        };
    }, [seletorMusicaAberto, termoMusica]);

    useEffect(() => {
        if (mensagens.length > 0) {
            requestAnimationFrame(() => listaRef.current?.scrollToEnd({ animated: true }));
        }
    }, [mensagens.length]);

    async function enviar() {
        const mensagem = texto.trim();
        if (!mensagem || enviando || !Number.isInteger(conversaId)) return;
        setEnviando(true);
        try {
            const enviada = await enviarMensagem(conversaId, mensagem);
            setMensagens((atuais) => atuais.some((item) => item.id === enviada.id) ? atuais : [...atuais, enviada]);
            ultimoIdRef.current = Math.max(ultimoIdRef.current, enviada.id);
            setTexto("");
            feedbackAcao();
        } catch (erroEnvio) {
            if (erroEnvio instanceof ApiError && erroEnvio.status === 403 && erroEnvio.message.toLocaleLowerCase().includes("bloquead")) {
                setBloqueadaPeloOutro(true);
            }
            Toast.show({
                type: "error",
                text1: "Não foi possível enviar a mensagem",
                text2: erroEnvio instanceof Error ? erroEnvio.message : "Tente novamente.",
            });
        } finally {
            setEnviando(false);
        }
    }

    async function enviarMusica(musica: Musica) {
        if (enviando || conversaBloqueada) return;
        setEnviando(true);
        try {
            const enviada = await compartilharMusica(conversaId, musica.id);
            setMensagens((atuais) => atuais.some((item) => item.id === enviada.id) ? atuais : [...atuais, enviada]);
            ultimoIdRef.current = Math.max(ultimoIdRef.current, enviada.id);
            setSeletorMusicaAberto(false);
            setTermoMusica("");
            feedbackAcao();
        } catch (erroEnvio) {
            if (erroEnvio instanceof ApiError && erroEnvio.status === 403 && erroEnvio.message.toLocaleLowerCase().includes("bloquead")) {
                setBloqueadaPeloOutro(true);
            }
            Toast.show({
                type: "error",
                text1: "Não foi possível compartilhar a música",
                text2: erroEnvio instanceof Error ? erroEnvio.message : "Tente novamente.",
            });
        } finally {
            setEnviando(false);
        }
    }

    async function atualizarPreferencia(configuracao: { silenciada?: boolean; bloqueada?: boolean }) {
        try {
            const atualizada = await atualizarConfiguracoesConversa(conversaId, configuracao);
            setMusicaSilenciada(atualizada.silenciadaPorMim);
            setBloqueadaPorMim(atualizada.bloqueadaPorMim);
            setBloqueadaPeloOutro(atualizada.bloqueadaPeloOutro);
            Toast.show({
                type: "success",
                text1: configuracao.silenciada !== undefined
                    ? (atualizada.silenciadaPorMim ? "Conversa silenciada" : "Notificações reativadas")
                    : (atualizada.bloqueadaPorMim ? "Conversa bloqueada" : "Conversa desbloqueada"),
            });
        } catch (erroConfiguracao) {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar a conversa",
                text2: erroConfiguracao instanceof Error ? erroConfiguracao.message : "Tente novamente.",
            });
        }
    }

    function abrirOpcoes() {
        setOpcoesConversaAbertas(true);
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" />
            <View className="mx-4 mb-2 flex-row items-center border-b border-[#D5E0EC] dark:border-[#202633] px-1 pb-3">
                <Image source={foto ? { uri: foto } : imagemPadrao} className="h-10 w-10 rounded-full bg-[#202636]" />
                <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{nome || username || "Conversa privada"}</Text>
                    {username ? <Text className="mt-0.5 text-xs text-[#52677F] dark:text-[#8793A7]">@{username}</Text> : null}
                </View>
                <Pressable
                    onPress={abrirOpcoes}
                    accessibilityRole="button"
                    accessibilityLabel="Opções da conversa"
                    className="h-10 w-10 items-center justify-center rounded-full border border-[#D5E0EC] bg-white dark:border-[#293143] dark:bg-[#171E2B]"
                >
                    <DotsThreeIcon size={23} color="#8793A7" weight="bold" />
                </Pressable>
            </View>

            <MenuAcoes
                aberto={opcoesConversaAbertas}
                titulo="Opções da conversa"
                aoFechar={() => setOpcoesConversaAbertas(false)}
            >
                <ItemMenuAcao
                    titulo={musicaSilenciada ? "Reativar notificações" : "Silenciar notificações"}
                    descricao={musicaSilenciada ? "Voltar a receber alertas desta conversa" : "Parar os alertas desta conversa"}
                    icone={musicaSilenciada ? <BellIcon size={19} color="#58AAF0" /> : <BellSlashIcon size={19} color="#58AAF0" />}
                    aoPressionar={() => {
                        setOpcoesConversaAbertas(false);
                        void atualizarPreferencia({ silenciada: !musicaSilenciada });
                    }}
                />
                <ItemMenuAcao
                    titulo={bloqueadaPorMim ? "Desbloquear conversa" : "Bloquear conversa"}
                    descricao={bloqueadaPorMim ? "Permitir o envio de mensagens novamente" : "Impedir o envio de mensagens nesta conversa"}
                    icone={bloqueadaPorMim ? <LockKeyIcon size={19} color="#58AAF0" /> : <ProhibitIcon size={19} color="#E2717C" />}
                    destrutivo={!bloqueadaPorMim}
                    aoPressionar={() => {
                        setOpcoesConversaAbertas(false);
                        void atualizarPreferencia({ bloqueada: !bloqueadaPorMim });
                    }}
                />
            </MenuAcoes>

            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
                {carregando ? (
                    <View className="flex-1 items-center justify-center"><ActivityIndicator color="#58AAF0" /></View>
                ) : erro ? (
                    <View className="flex-1 items-center justify-center px-8">
                        <Text className="text-center text-sm leading-5 text-[#405570] dark:text-[#D0D8E4]">{erro}</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={listaRef}
                        data={mensagens}
                        keyExtractor={(mensagem) => String(mensagem.id)}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: mensagens.length ? "flex-start" : "center", paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
                        ListEmptyComponent={<Text className="px-8 text-center text-sm leading-5 text-[#52677F] dark:text-[#8793A7]">Esta conversa está vazia. Envie uma mensagem para começar.</Text>}
                        renderItem={({ item, index }) => {
                            const minha = item.remetenteId === meuId;
                            const primeiroDoDia = index === 0
                                || chaveDoDia(mensagens[index - 1].criadaEm) !== chaveDoDia(item.criadaEm);
                            return (
                                <View className="w-full">
                                    {primeiroDoDia ? (
                                        <View className="my-2 flex-row items-center justify-center">
                                            <View className="h-px flex-1 bg-[#202633]" />
                                            <Text className="mx-3 text-[11px] font-medium text-[#52677F] dark:text-[#8793A7]">
                                                {formatarSeparadorDoDia(item.criadaEm)}
                                            </Text>
                                            <View className="h-px flex-1 bg-[#202633]" />
                                        </View>
                                    ) : null}
                                    <View className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 ${minha ? "self-end rounded-br-md bg-[#1C4770]" : "self-start rounded-bl-md bg-[#F4F7FA] dark:bg-[#171E2B]"}`}>
                                        {item.musica ? (
                                            <Pressable
                                                onPress={() => router.push(`/musica/${item.musica!.id}` as never)}
                                                className="w-60 max-w-full flex-row items-center"
                                                accessibilityRole="link"
                                                accessibilityLabel={`Abrir música ${item.musica.titulo}, de ${item.musica.artista.nome}`}
                                            >
                                                <Image
                                                    source={item.musica.capa ? { uri: item.musica.capa } : imagemPadrao}
                                                    className="h-12 w-12 rounded-lg bg-[#202636]"
                                                />
                                                <View className="ml-2 min-w-0 flex-1">
                                                    <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={2}>{item.musica.titulo}</Text>
                                                    <Text className="mt-1 text-xs text-[#405570] dark:text-[#D0D8E4]" numberOfLines={1}>{item.musica.artista.nome}</Text>
                                                    <Text className="mt-1 text-[10px] text-[#B9DDF9]">Ver música ›</Text>
                                                </View>
                                            </Pressable>
                                        ) : (
                                            <Text className="text-sm leading-5 text-[#142338] dark:text-white">
                                                {item.texto.startsWith("[[mare-musica:") ? "Música removida do catálogo." : item.texto}
                                            </Text>
                                        )}
                                        <View className="mt-1 flex-row items-center justify-end">
                                            <Text className={`text-[10px] ${minha ? "text-[#BEDDFA]" : "text-[#52677F] dark:text-[#8793A7]"}`}>{formatarHora(item.criadaEm)}</Text>
                                            {minha ? (
                                                <Text className={`ml-1 text-[10px] ${item.lidaEm ? "text-[#A8E1FF]" : "text-[#BEDDFA]"}`}>
                                                    {item.lidaEm || idsMensagensLidas.has(item.id) ? "· Lida" : "· Enviada"}
                                                </Text>
                                            ) : null}
                                        </View>
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}

                {conversaBloqueada ? (
                    <View className="border-t border-[#D5E0EC] dark:border-[#202633] bg-[#0C0F16] px-4 py-4">
                        <Text className="text-center text-xs leading-5 text-[#AEB8C8]">
                            {bloqueadaPorMim ? "Você bloqueou esta conversa. Use o menu para desbloquear." : "Esta pessoa bloqueou a conversa."}
                        </Text>
                    </View>
                ) : (
                    <View className="flex-row items-end border-t border-[#D5E0EC] dark:border-[#202633] bg-[#0C0F16] px-3 py-2.5">
                        <Pressable
                            onPress={() => setSeletorMusicaAberto(true)}
                            disabled={carregando || Boolean(erro) || enviando}
                            accessibilityRole="button"
                            accessibilityLabel="Compartilhar música"
                            className="mr-2 h-11 w-11 items-center justify-center rounded-full border border-[#C5D3E1] dark:border-[#293143] bg-[#151A25]"
                        >
                            <MusicNoteIcon size={20} color="#7FBFFA" />
                        </Pressable>
                        <TextInput
                            value={texto}
                            onChangeText={setTexto}
                            placeholder="Escreva uma mensagem"
                            placeholderTextColor="#718096"
                            multiline
                            maxLength={2000}
                            editable={!carregando && !erro && !enviando}
                            className="max-h-28 min-h-11 flex-1 rounded-2xl border border-[#C5D3E1] dark:border-[#293143] bg-[#151A25] px-4 py-3 text-sm text-[#142338] dark:text-white"
                            accessibilityLabel="Mensagem"
                        />
                        <Pressable
                            onPress={() => void enviar()}
                            disabled={!texto.trim() || enviando || carregando || Boolean(erro)}
                            accessibilityRole="button"
                            accessibilityLabel="Enviar mensagem"
                            className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-[#58AAF0]"
                            style={{ opacity: !texto.trim() || enviando || carregando || Boolean(erro) ? 0.45 : 1 }}
                        >
                            {enviando ? <ActivityIndicator size="small" color="#07111C" /> : <PaperPlaneTiltIcon size={19} color="#07111C" weight="fill" />}
                        </Pressable>
                    </View>
                )}
            </KeyboardAvoidingView>
            <Modal
                visible={seletorMusicaAberto}
                animationType="slide"
                transparent
                onRequestClose={() => setSeletorMusicaAberto(false)}
            >
                <SafeAreaView className="flex-1 justify-end bg-black/60">
                    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="max-h-[82%] rounded-t-3xl border-t border-[#C5D3E1] dark:border-[#293143] bg-[#F4F7FA] dark:bg-[#0D111A] px-4 pb-3 pt-5">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View>
                                <Text className="font-serif text-xl text-[#142338] dark:text-white">Compartilhar música</Text>
                                <Text className="mt-1 text-xs text-[#52677F] dark:text-[#8793A7]">Escolha uma faixa do catálogo Maré.</Text>
                            </View>
                            <Pressable onPress={() => setSeletorMusicaAberto(false)} accessibilityLabel="Fechar seletor de músicas" className="h-10 w-10 items-center justify-center rounded-full bg-[#F4F7FA] dark:bg-[#171E2B]">
                                <XIcon size={19} color="#D0D8E4" />
                            </Pressable>
                        </View>
                        <TextInput
                            value={termoMusica}
                            onChangeText={setTermoMusica}
                            placeholder="Pesquisar música ou artista"
                            placeholderTextColor="#718096"
                            autoFocus
                            autoCorrect={false}
                            className="mb-3 h-12 rounded-xl border border-[#C5D3E1] dark:border-[#293143] bg-[#151A25] px-4 text-sm text-[#142338] dark:text-white"
                            accessibilityLabel="Pesquisar música para compartilhar"
                        />
                        {buscandoMusica ? <ActivityIndicator className="my-5" color="#58AAF0" /> : null}
                        <FlatList
                            data={resultadosMusica}
                            keyExtractor={(musica) => String(musica.id)}
                            keyboardShouldPersistTaps="handled"
                            className="max-h-[56%]"
                            ListEmptyComponent={(
                                <Text className="px-4 py-8 text-center text-sm leading-5 text-[#52677F] dark:text-[#8793A7]">
                                    {buscandoMusica ? "" : erroBuscaMusica || (termoMusica.trim().length < 2 ? "Digite pelo menos duas letras para pesquisar." : "Nenhuma música encontrada.")}
                                </Text>
                            )}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => void enviarMusica(item)}
                                    disabled={enviando}
                                    className="mb-2 flex-row items-center rounded-xl border border-[#D5E0EC] dark:border-[#252D3C] bg-[#111722] p-2.5"
                                >
                                    <Image source={item.capa ? { uri: item.capa } : imagemPadrao} className="h-12 w-12 rounded-lg bg-[#202636]" />
                                    <View className="ml-3 min-w-0 flex-1">
                                        <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{item.titulo}</Text>
                                        <Text className="mt-1 text-xs text-[#52677F] dark:text-[#9AA5B5]" numberOfLines={1}>{item.artista?.nome ?? "Artista desconhecido"}</Text>
                                    </View>
                                    {enviando ? <ActivityIndicator color="#58AAF0" /> : <MusicNoteIcon size={18} color="#58AAF0" />}
                                </Pressable>
                            )}
                        />
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

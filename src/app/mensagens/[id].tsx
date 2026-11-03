import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { PaperPlaneTiltIcon } from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Topbar from "../../components/topbar";
import { buscarMeuPerfil } from "../../services/usuarioService";
import {
    buscarMensagens,
    enviarMensagem,
    marcarConversaComoLida,
    type MensagemPrivada,
} from "../../services/mensagemPrivadaService";
import { feedbackAcao } from "../../services/feedbackTatil";

const imagemPadrao = require("../../../assets/images/logo.png");

function formatarHora(dataIso: string) {
    const data = new Date(dataIso);
    return Number.isNaN(data.getTime())
        ? ""
        : data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function ConversaPrivada() {
    const { id: idParam, nome, username, foto } = useLocalSearchParams<{
        id: string;
        nome?: string;
        username?: string;
        foto?: string;
    }>();
    const conversaId = Number(idParam);
    const listaRef = useRef<FlatList<MensagemPrivada> | null>(null);
    const ultimoIdRef = useRef(0);
    const atualizandoRef = useRef(false);
    const [mensagens, setMensagens] = useState<MensagemPrivada[]>([]);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [texto, setTexto] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

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
                const novas = await buscarMensagens(conversaId, inicial ? undefined : ultimoIdRef.current || undefined);
                if (!ativo) return;
                if (inicial) {
                    setMensagens(novas);
                    const perfil = await buscarMeuPerfil();
                    if (!ativo) return;
                    setMeuId(perfil.id);
                } else if (novas.length > 0) {
                    setMensagens((atuais) => {
                        const idsExistentes = new Set(atuais.map((mensagem) => mensagem.id));
                        return [...atuais, ...novas.filter((mensagem) => !idsExistentes.has(mensagem.id))];
                    });
                }

                if (ativo) setErro("");
                const ultimo = novas[novas.length - 1];
                if (ultimo) ultimoIdRef.current = Math.max(ultimoIdRef.current, ultimo.id);
                await marcarConversaComoLida(conversaId).catch(() => undefined);
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
    }, [conversaId]);

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
            Toast.show({
                type: "error",
                text1: "Não foi possível enviar a mensagem",
                text2: erroEnvio instanceof Error ? erroEnvio.message : "Tente novamente.",
            });
        } finally {
            setEnviando(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar tipo="voltar" />
            <View className="mx-4 mb-2 flex-row items-center border-b border-[#202633] px-1 pb-3">
                <Image source={foto ? { uri: foto } : imagemPadrao} className="h-10 w-10 rounded-full bg-[#202636]" />
                <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-white" numberOfLines={1}>{nome || username || "Conversa privada"}</Text>
                    {username ? <Text className="mt-0.5 text-xs text-[#8793A7]">@{username}</Text> : null}
                </View>
            </View>

            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
                {carregando ? (
                    <View className="flex-1 items-center justify-center"><ActivityIndicator color="#58AAF0" /></View>
                ) : erro ? (
                    <View className="flex-1 items-center justify-center px-8">
                        <Text className="text-center text-sm leading-5 text-[#D0D8E4]">{erro}</Text>
                    </View>
                ) : (
                    <FlatList
                        ref={listaRef}
                        data={mensagens}
                        keyExtractor={(mensagem) => String(mensagem.id)}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: mensagens.length ? "flex-start" : "center", paddingHorizontal: 16, paddingVertical: 14, gap: 10 }}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: false })}
                        ListEmptyComponent={<Text className="px-8 text-center text-sm leading-5 text-[#8793A7]">Esta conversa está vazia. Envie uma mensagem para começar.</Text>}
                        renderItem={({ item }) => {
                            const minha = item.remetenteId === meuId;
                            return (
                                <View className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 ${minha ? "self-end rounded-br-md bg-[#1C4770]" : "self-start rounded-bl-md bg-[#171E2B]"}`}>
                                    <Text className="text-sm leading-5 text-white">{item.texto}</Text>
                                    <Text className={`mt-1 self-end text-[10px] ${minha ? "text-[#BEDDFA]" : "text-[#8793A7]"}`}>{formatarHora(item.criadaEm)}</Text>
                                </View>
                            );
                        }}
                    />
                )}

                <View className="flex-row items-end border-t border-[#202633] bg-[#0C0F16] px-3 py-2.5">
                    <TextInput
                        value={texto}
                        onChangeText={setTexto}
                        placeholder="Escreva uma mensagem"
                        placeholderTextColor="#718096"
                        multiline
                        maxLength={2000}
                        editable={!carregando && !erro && !enviando}
                        className="max-h-28 min-h-11 flex-1 rounded-2xl border border-[#293143] bg-[#151A25] px-4 py-3 text-sm text-white"
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

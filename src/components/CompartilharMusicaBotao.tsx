import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, Pressable, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShareNetworkIcon, XIcon } from "phosphor-react-native";
import Toast from "react-native-toast-message";

import {
    buscarConversas,
    compartilharMusica,
    type ConversaPrivada,
} from "../services/mensagemPrivadaService";
import { linkMusica } from "../services/linksCompartilhamento";

const imagemPadrao = require("../../assets/images/logo.png");

type Props = {
    musicaId: number;
    titulo: string;
    artista: string;
    classeBotao?: string;
    corIcone?: string;
    tamanhoIcone?: number;
};

/** Abre o compartilhamento nativo ou envia a música para uma conversa existente. */
export default function CompartilharMusicaBotao({
    musicaId,
    titulo,
    artista,
    classeBotao = "h-10 w-10 items-center justify-center rounded-full bg-black/55",
    corIcone = "#FFFFFF",
    tamanhoIcone = 19,
}: Props) {
    const [aberto, setAberto] = useState(false);
    const [conversas, setConversas] = useState<ConversaPrivada[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const [enviandoPara, setEnviandoPara] = useState<number | null>(null);

    useEffect(() => {
        if (!aberto) return;
        let ativo = true;
        setCarregando(true);
        setErro("");

        void buscarConversas()
            .then((lista) => {
                if (ativo) setConversas(lista.filter((conversa) => !conversa.bloqueadaPorMim && !conversa.bloqueadaPeloOutro));
            })
            .catch((erroBusca) => {
                console.error("Erro ao carregar conversas para compartilhar música:", erroBusca);
                if (ativo) setErro("Não foi possível carregar suas conversas. Tente novamente.");
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => { ativo = false; };
    }, [aberto]);

    async function compartilharForaDoApp() {
        try {
            await Share.share({ message: `Confira “${titulo}” de ${artista} na Maré:\n${linkMusica(musicaId)}` });
            setAberto(false);
        } catch (erroCompartilhamento) {
            console.error("Erro ao abrir o compartilhamento nativo:", erroCompartilhamento);
            Toast.show({ type: "error", text1: "Não foi possível compartilhar a música." });
        }
    }

    async function enviarParaConversa(conversa: ConversaPrivada) {
        if (enviandoPara !== null) return;
        setEnviandoPara(conversa.id);
        try {
            await compartilharMusica(conversa.id, musicaId);
            setAberto(false);
            Toast.show({
                type: "success",
                text1: "Música enviada",
                text2: `Enviada para ${conversa.outroUsuario.nome}.`,
            });
        } catch (erroEnvio) {
            Toast.show({
                type: "error",
                text1: "Não foi possível enviar a música",
                text2: erroEnvio instanceof Error ? erroEnvio.message : "Tente novamente.",
            });
        } finally {
            setEnviandoPara(null);
        }
    }

    return (
        <>
            <Pressable
                onPress={(evento) => {
                    evento.stopPropagation();
                    setAberto(true);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Compartilhar ${titulo}`}
                className={classeBotao}
                hitSlop={6}
            >
                <ShareNetworkIcon size={tamanhoIcone} color={corIcone} />
            </Pressable>

            <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
                <SafeAreaView className="flex-1 justify-end bg-black/60">
                    <View className="max-h-[82%] rounded-t-3xl border-t border-[#C5D3E1] bg-[#F4F7FA] px-4 pb-4 pt-5 dark:border-[#293143] dark:bg-[#0D111A]">
                        <View className="mb-4 flex-row items-center justify-between">
                            <View className="mr-3 flex-1">
                                <Text className="font-serif text-xl text-[#142338] dark:text-white">Compartilhar música</Text>
                                <Text className="mt-1 text-xs text-[#52677F] dark:text-[#8793A7]" numberOfLines={1}>{titulo} · {artista}</Text>
                            </View>
                            <Pressable onPress={() => setAberto(false)} accessibilityLabel="Fechar compartilhamento" className="h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-[#171E2B]">
                                <XIcon size={19} color="#8793A7" />
                            </Pressable>
                        </View>

                        <Pressable
                            onPress={() => void compartilharForaDoApp()}
                            className="mb-4 h-12 flex-row items-center justify-center rounded-xl bg-[#58AAF0]"
                        >
                            <ShareNetworkIcon size={18} color="#07111C" />
                            <Text className="ml-2 text-sm font-semibold text-[#07111C]">Outros aplicativos</Text>
                        </Pressable>

                        <Text className="mb-2 text-sm font-semibold text-[#142338] dark:text-white">Enviar em uma conversa</Text>
                        {carregando ? (
                            <ActivityIndicator className="py-8" color="#58AAF0" />
                        ) : erro ? (
                            <Text className="px-4 py-8 text-center text-sm text-[#52677F] dark:text-[#AAB4C5]">{erro}</Text>
                        ) : (
                            <FlatList
                                data={conversas}
                                keyExtractor={(conversa) => String(conversa.id)}
                                keyboardShouldPersistTaps="handled"
                                className="max-h-[48%]"
                                ListEmptyComponent={(
                                    <Text className="px-5 py-7 text-center text-sm leading-5 text-[#52677F] dark:text-[#8793A7]">
                                        Você ainda não tem conversas disponíveis. Para enviar mensagens, vocês precisam se seguir.
                                    </Text>
                                )}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => void enviarParaConversa(item)}
                                        disabled={enviandoPara !== null}
                                        className="mb-2 flex-row items-center rounded-xl border border-[#D5E0EC] bg-white p-3 dark:border-[#252D3C] dark:bg-[#111722]"
                                    >
                                        <Image
                                            source={item.outroUsuario.foto ? { uri: item.outroUsuario.foto } : imagemPadrao}
                                            className="h-11 w-11 rounded-full bg-[#202636]"
                                        />
                                        <View className="ml-3 min-w-0 flex-1">
                                            <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{item.outroUsuario.nome}</Text>
                                            <Text className="mt-0.5 text-xs text-[#52677F] dark:text-[#8793A7]" numberOfLines={1}>@{item.outroUsuario.username}</Text>
                                        </View>
                                        {enviandoPara === item.id ? <ActivityIndicator color="#58AAF0" /> : null}
                                    </Pressable>
                                )}
                            />
                        )}
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}

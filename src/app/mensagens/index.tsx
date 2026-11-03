import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { BellSlashIcon, ChatCircleDotsIcon } from "phosphor-react-native";

import Navbar from "../../components/navbar";
import Topbar from "../../components/topbar";
import { buscarConversas, type ConversaPrivada } from "../../services/mensagemPrivadaService";

const imagemPadrao = require("../../../assets/images/logo.png");

function formatarData(dataIso: string) {
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime())) return "";
    const hoje = new Date();
    if (data.toDateString() === hoje.toDateString()) {
        return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ListaDeConversas() {
    const router = useRouter();
    const [conversas, setConversas] = useState<ConversaPrivada[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const [chaveAtualizacao, setChaveAtualizacao] = useState(0);

    useFocusEffect(useCallback(() => {
        let ativo = true;
        setErro("");
        setCarregando(true);
        void buscarConversas()
            .then((dados) => { if (ativo) setConversas(dados); })
            .catch((erroBusca) => {
                console.error("Erro ao carregar as conversas:", erroBusca);
                if (ativo) setErro("Não foi possível carregar suas conversas. Tente atualizar.");
            })
            .finally(() => {
                if (ativo) {
                    setCarregando(false);
                    setAtualizando(false);
                }
            });
        return () => { ativo = false; };
    }, [chaveAtualizacao]));

    function atualizar() {
        setAtualizando(true);
        setChaveAtualizacao((chave) => chave + 1);
    }

    function abrirConversa(conversa: ConversaPrivada) {
        router.push({
            pathname: "/mensagens/[id]",
            params: {
                id: String(conversa.id),
                nome: conversa.outroUsuario.nome,
                username: conversa.outroUsuario.username,
                foto: conversa.outroUsuario.foto ?? "",
            },
        } as never);
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor="#58AAF0" colors={["#58AAF0"]} />}
            >
                <View className="mb-4 mt-1 flex-row items-center">
                    <View>
                        <Text className="font-serif text-2xl text-[#142338] dark:text-white">Conversas</Text>
                        <Text className="mt-1 text-xs text-[#52677F] dark:text-[#9AA5B5]">Mensagens privadas com pessoas da Maré</Text>
                    </View>
                </View>

                {carregando ? (
                    <View className="py-14"><ActivityIndicator color="#58AAF0" /></View>
                ) : erro ? (
                    <View className="rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-5">
                        <Text className="text-sm leading-5 text-[#405570] dark:text-[#D0D8E4]">{erro}</Text>
                    </View>
                ) : conversas.length > 0 ? (
                    conversas.map((conversa) => (
                        <Pressable
                            key={conversa.id}
                            onPress={() => abrirConversa(conversa)}
                            accessibilityRole="button"
                            accessibilityLabel={`Conversa com ${conversa.outroUsuario.nome}${conversa.mensagensNaoLidas ? `, ${conversa.mensagensNaoLidas} não lidas` : ""}`}
                            className="mb-2 flex-row items-center rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-3"
                        >
                            <Image
                                source={conversa.outroUsuario.foto ? { uri: conversa.outroUsuario.foto } : imagemPadrao}
                                className="h-12 w-12 rounded-full bg-[#202636]"
                            />
                            <View className="ml-3 min-w-0 flex-1">
                                <View className="flex-row items-center justify-between">
                                    <Text className="flex-1 text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{conversa.outroUsuario.nome}</Text>
                                    <Text className="ml-2 text-[10px] text-[#52677F] dark:text-[#718096]">{conversa.ultimaMensagem ? formatarData(conversa.ultimaMensagem.criadaEm) : ""}</Text>
                                </View>
                                <Text className="mt-1 text-xs text-[#52677F] dark:text-[#9AA5B5]" numberOfLines={1}>
                                    {conversa.ultimaMensagem?.texto ?? `@${conversa.outroUsuario.username}`}
                                </Text>
                                    {conversa.bloqueadaPorMim || conversa.bloqueadaPeloOutro ? (
                                        <Text className="mt-1 text-[10px] text-[#F08B8B]">Conversa bloqueada</Text>
                                    ) : conversa.silenciadaPorMim ? (
                                        <View className="mt-1 flex-row items-center">
                                            <BellSlashIcon size={11} color="#8793A7" />
                                            <Text className="ml-1 text-[10px] text-[#52677F] dark:text-[#8793A7]">Silenciada</Text>
                                        </View>
                                    ) : null}
                            </View>
                            {conversa.mensagensNaoLidas > 0 ? (
                                <View className="ml-3 min-w-5 items-center rounded-full bg-[#58AAF0] px-1.5 py-1">
                                    <Text className="text-[10px] font-bold text-[#07111C]">{conversa.mensagensNaoLidas > 99 ? "99+" : conversa.mensagensNaoLidas}</Text>
                                </View>
                            ) : null}
                        </Pressable>
                    ))
                ) : (
                    <View className="mt-3 items-center rounded-3xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] px-7 py-10">
                        <ChatCircleDotsIcon size={34} color="#718096" />
                        <Text className="mt-4 text-center font-serif text-xl text-[#142338] dark:text-white">Suas conversas começam aqui</Text>
                        <Text className="mt-2 text-center text-sm leading-5 text-[#52677F] dark:text-[#9AA5B5]">Abra o perfil de alguém e toque em Mensagem para começar um papo privado.</Text>
                    </View>
                )}
            </ScrollView>
            <Navbar />
        </SafeAreaView>
    );
}

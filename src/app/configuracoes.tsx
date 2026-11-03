import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
    BellIcon,
    ChatCircleIcon,
    HeartIcon,
    FileTextIcon,
    MusicNotesIcon,
    ShieldCheckIcon,
    SignOutIcon,
    TrashIcon,
    UserPlusIcon,
} from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import { fazerLogout } from "../services/authService";
import {
    buscarPreferenciasNotificacao,
    salvarPreferenciasNotificacao,
    type PreferenciasNotificacao,
} from "../services/preferenciaService";
import { excluirMinhaConta } from "../services/usuarioService";
import {
    ativarNotificacoesPush,
    removerTokenPushDoServidor,
    verificarRegistroPush,
} from "../services/notificacaoPushService";

const preferenciasPadrao: PreferenciasNotificacao = {
    curtidas: true,
    comentarios: true,
    seguidores: true,
};

export default function Configuracoes() {
    const roteador = useRouter();
    const [preferencias, setPreferencias] = useState(preferenciasPadrao);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState<keyof PreferenciasNotificacao | null>(null);
    const [pushAtivo, setPushAtivo] = useState(false);
    const [alterandoPush, setAlterandoPush] = useState(false);

    // As preferências são guardadas na conta e sincronizadas com o servidor.
    const carregarPreferencias = useCallback(async () => {
        setCarregando(true);
        setErro("");
        try {
            const salvas = await buscarPreferenciasNotificacao();
            setPreferencias(salvas);
        } catch (erroCarregamento) {
            setErro(
                erroCarregamento instanceof Error
                    ? erroCarregamento.message
                    : "Não foi possível carregar as configurações.",
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void carregarPreferencias();
    }, [carregarPreferencias]);

    useEffect(() => {
        let ativo = true;
        void verificarRegistroPush()
            .then((registrado) => { if (ativo) setPushAtivo(registrado); })
            .catch((erro) => console.warn("Não foi possível consultar a permissão de push:", erro));
        return () => { ativo = false; };
    }, []);

    async function alternarNotificacoesPush(ativar: boolean) {
        if (alterandoPush) return;
        setAlterandoPush(true);
        try {
            if (ativar) {
                await ativarNotificacoesPush();
                setPushAtivo(true);
                Toast.show({
                    type: "success",
                    text1: "Notificações ativadas",
                    text2: "Você receberá novidades da Maré neste aparelho.",
                });
            } else {
                await removerTokenPushDoServidor();
                setPushAtivo(false);
            }
        } catch (erro) {
            Toast.show({
                type: "error",
                text1: "Não foi possível ativar notificações",
                text2: erro instanceof Error ? erro.message : "Tente novamente.",
            });
        } finally {
            setAlterandoPush(false);
        }
    }

    async function alternarPreferencia(chave: keyof PreferenciasNotificacao) {
        if (salvando !== null) return;

        const anteriores = preferencias;
        const atualizadas = { ...anteriores, [chave]: !anteriores[chave] };
        setPreferencias(atualizadas);
        setSalvando(chave);

        try {
            const salvas = await salvarPreferenciasNotificacao(atualizadas);
            setPreferencias(salvas);
        } catch (erroSalvamento) {
            setPreferencias(anteriores);
            Toast.show({
                type: "error",
                text1: "Não foi possível salvar",
                text2:
                    erroSalvamento instanceof Error
                        ? erroSalvamento.message
                        : "Tente novamente.",
            });
        } finally {
            setSalvando(null);
        }
    }

    function confirmarSaida() {
        Alert.alert("Sair da conta?", "Você precisará entrar novamente para usar o Maré.", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                style: "default",
                onPress: () => {
                    void (async () => {
                            try {
                                await fazerLogout();
                            } finally {
                                roteador.replace("/login");
                            }
                    })();
                },
            },
        ]);
    }

    function confirmarExclusaoConta() {
        Alert.alert(
            "Excluir conta permanentemente?",
            "Seu perfil e seus dados associados serão removidos. Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir conta",
                    style: "destructive",
                    onPress: () => {
                        void (async () => {
                            try {
                                await excluirMinhaConta();
                                await fazerLogout();
                                roteador.replace("/login");
                            } catch (erroExclusao) {
                                Toast.show({
                                    type: "error",
                                    text1: "Não foi possível excluir a conta",
                                    text2: erroExclusao instanceof Error ? erroExclusao.message : "Tente novamente.",
                                });
                            }
                        })();
                    },
                },
            ],
        );
    }

    function linhaNotificacao(
        titulo: string,
        descricao: string,
        chave: keyof PreferenciasNotificacao,
        Icone: typeof HeartIcon,
    ) {
        return (
            <View key={chave} className="flex-row items-center py-4 border-b border-[#202633]">
                <View className="w-10 h-10 rounded-full bg-[#171E2B] items-center justify-center">
                    <Icone size={20} color="#58AAF0" />
                </View>
                <View className="flex-1 ml-3 mr-2">
                    <Text className="text-white text-sm">{titulo}</Text>
                    <Text className="text-[#718096] text-xs mt-1">{descricao}</Text>
                </View>
                <Switch
                    value={preferencias[chave]}
                    onValueChange={() => void alternarPreferencia(chave)}
                    disabled={carregando || salvando !== null}
                    trackColor={{ false: "#354052", true: "#28577D" }}
                    thumbColor={preferencias[chave] ? "#58AAF0" : "#A0A8B5"}
                />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar
                titulo="Configurações"
                subtitulo="Gerencie sua conta e suas preferências"
                tipo="voltar"
            />

            <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                <View className="mb-7">
                    <Text className="text-white text-base font-serif mb-1">
                        Preferências musicais
                    </Text>
                    <Text className="text-[#718096] text-xs mb-4">
                        Personalize as recomendações do seu feed.
                    </Text>
                    <Pressable
                        onPress={() => roteador.push("/filtrar?modo=generos" as never)}
                        className="flex-row items-center rounded-xl border border-[#252D3C] bg-[#111420] px-4 py-4"
                    >
                        <MusicNotesIcon size={21} color="#58AAF0" />
                        <View className="flex-1 ml-3">
                            <Text className="text-white text-sm">Gêneros favoritos</Text>
                            <Text className="text-[#718096] text-xs mt-1">
                                Escolha os estilos que você quer ver mais.
                            </Text>
                        </View>
                        <Text className="text-[#58AAF0] text-xs">Editar</Text>
                    </Pressable>
                </View>

                <View className="mb-7">
                    <View className="flex-row items-center mb-1">
                        <BellIcon size={19} color="#58AAF0" />
                        <Text className="text-white text-base font-serif ml-2">
                            Notificações
                        </Text>
                    </View>
                    <Text className="text-[#718096] text-xs mb-2">
                        Escolha quais atividades devem aparecer para você e no celular.
                    </Text>

                    {carregando ? (
                        <View className="py-8 items-center">
                            <ActivityIndicator color="#58AAF0" />
                        </View>
                    ) : erro ? (
                        <View className="py-4">
                            <Text className="text-red-400 text-sm">{erro}</Text>
                            <Pressable onPress={() => void carregarPreferencias()} className="mt-3">
                                <Text className="text-[#58AAF0] text-sm">Tentar novamente</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View>
                            <View className="flex-row items-center border-b border-[#202633] py-4">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#171E2B]">
                                    <BellIcon size={20} color="#58AAF0" />
                                </View>
                                <View className="ml-3 mr-2 flex-1">
                                    <Text className="text-sm text-white">Notificações no celular</Text>
                                    <Text className="mt-1 text-xs text-[#718096]">
                                        Receba alertas mesmo quando o app estiver fechado.
                                    </Text>
                                </View>
                                <Switch
                                    value={pushAtivo}
                                    onValueChange={(valor) => void alternarNotificacoesPush(valor)}
                                    disabled={alterandoPush}
                                    trackColor={{ false: "#354052", true: "#28577D" }}
                                    thumbColor={pushAtivo ? "#58AAF0" : "#A0A8B5"}
                                />
                            </View>
                            {linhaNotificacao("Curtidas", "Quando alguém curtir suas publicações.", "curtidas", HeartIcon)}
                            {linhaNotificacao("Comentários", "Quando alguém comentar nas suas publicações.", "comentarios", ChatCircleIcon)}
                            {linhaNotificacao("Novos seguidores", "Quando alguém começar a seguir você.", "seguidores", UserPlusIcon)}
                        </View>
                    )}
                </View>

                <View className="mb-7">
                    <Text className="text-white text-base font-serif mb-3">Sobre</Text>
                    <Pressable
                        onPress={() => roteador.push("/termos" as never)}
                        className="flex-row items-center rounded-xl border border-[#252D3C] bg-[#111420] px-4 py-4 mb-2"
                    >
                        <ShieldCheckIcon size={20} color="#9AA6BA" />
                        <Text className="flex-1 text-[#D0D0D5] text-sm ml-3">Termos de uso</Text>
                        <Text className="text-[#718096] text-lg">›</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => roteador.push("/privacidade" as never)}
                        className="flex-row items-center rounded-xl border border-[#252D3C] bg-[#111420] px-4 py-4"
                    >
                        <FileTextIcon size={20} color="#9AA6BA" />
                        <Text className="flex-1 text-[#D0D0D5] text-sm ml-3">Privacidade</Text>
                        <Text className="text-[#718096] text-lg">›</Text>
                    </Pressable>
                </View>

                <Pressable
                    onPress={confirmarSaida}
                    className="flex-row items-center rounded-xl border border-[#252D3C] bg-[#111420] px-4 py-4 mb-2"
                >
                    <SignOutIcon size={21} color="#D0D0D5" />
                    <Text className="text-[#D0D0D5] text-sm font-semibold ml-3">
                        Sair da conta
                    </Text>
                </Pressable>

                <Pressable
                    onPress={confirmarExclusaoConta}
                    className="flex-row items-center rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-4 mb-8"
                >
                    <TrashIcon size={21} color="#F87171" />
                    <Text className="text-red-400 text-sm font-semibold ml-3">
                        Excluir conta permanentemente
                    </Text>
                </Pressable>
            </ScrollView>

            <Navbar />
        </SafeAreaView>
    );
}

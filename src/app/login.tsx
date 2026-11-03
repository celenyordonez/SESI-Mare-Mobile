
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { EyeIcon, EyeSlashIcon } from "phosphor-react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { ApiError } from "../services/api";
import {
    fazerLogin,
    reenviarVerificacao,
} from "../services/authService";
import Toast from "react-native-toast-message";
import { ativarPushPadraoNoLogin } from "../services/notificacaoPushService";

export default function Login() {
    const router = useRouter();

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [emailPendente, setEmailPendente] = useState(false);
    const [reenviando, setReenviando] = useState(false);
    const [mostrarSenha, setMostrarSenha] = useState(false);

    async function entrar() {
        if (!usuario.trim() || !senha) {
            Toast.show({
                type: "error",
                text1: "Campos incompletos",
                text2: "Preencha o usuário e a senha.",
            });
            return;
        }

        try {
            setCarregando(true);
            setEmailPendente(false);

            const resposta = await fazerLogin(usuario.trim(), senha);

            // Solicita a permissão do Android no primeiro login e registra este aparelho.
            void ativarPushPadraoNoLogin().catch((erroPush) => {
                console.warn("Não foi possível ativar as notificações push neste aparelho:", erroPush);
            });

            Toast.show({
                type: "success",
                text1: "Login realizado!",
                text2: "Bem-vindo de volta.",
            });

            router.replace(
                resposta.usuario.preferenciasConcluidas
                    ? "/home"
                    : ({ pathname: "/descoberta", params: { onboarding: "sim" } } as never),
            );
        } catch (erro) {
            if (
                erro instanceof ApiError &&
                erro.code === "EMAIL_NAO_VERIFICADO"
            ) {
                setEmailPendente(true);

                Toast.show({
                    type: "error",
                    text1: "E-mail não confirmado",
                    text2: "Confirme seu endereço antes de entrar.",
                });

                return;
            }

            Toast.show({
                type: "error",
                text1: "Erro ao fazer login",
                text2: erro instanceof Error
                    ? erro.message
                    : "Verifique seus dados e tente novamente.",
            });
        } finally {
            setCarregando(false);
        }
    }


    async function reenviarEmail() {
        try {
            setReenviando(true);

            await reenviarVerificacao(usuario.trim());

            Toast.show({
                type: "success",
                text1: "Solicitação realizada",
                text2: "Se a conta precisar de confirmação, enviaremos um novo e-mail.",
            });
        } catch (erro) {
            Toast.show({
                type: "error",
                text1: "Não foi possível reenviar",
                text2: erro instanceof Error
                    ? erro.message
                    : "Tente novamente.",
            });
        } finally {
            setReenviando(false);
        }
    }


    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <LinearGradient
                colors={["#080A10", "#1C2E48"]}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingHorizontal: 32,
                        paddingTop: 12,
                        paddingBottom: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View className="items-center justify-center mb-2">
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={{ width: 150, height: 100 }}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Título */}
                    <Text className="text-[#142338] dark:text-white text-2xl text-center font-serif">
                        Login
                    </Text>

                    <Text className="text-[#405570] dark:text-[#D0D0D5] text-xs text-center font-serif mt-1 mb-6">
                        Bem-vindo de volta! Continue de onde você parou.
                    </Text>

                    {/* Formulário */}
                    <View className="w-full">
                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            E-mail ou usuário
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#EAF1F8] dark:bg-[#0C121D] border border-[#C5D3E1] dark:border-[#354052] rounded-[9px] px-3 text-[#142338] dark:text-white text-[13px] mb-5"
                            value={usuario}
                            onChangeText={setUsuario}
                            placeholder="E-mail ou usuário"
                            placeholderTextColor="#718096"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Senha
                        </Text>

                        <View className="w-full h-12 flex-row items-center bg-[#EAF1F8] dark:bg-[#0C121D] border border-[#C5D3E1] dark:border-[#354052] rounded-[9px] mb-5">
                            <TextInput
                                className="flex-1 h-full px-3 text-[#142338] dark:text-white text-[13px]"
                                value={senha}
                                onChangeText={setSenha}
                                placeholder="Senha"
                                placeholderTextColor="#718096"
                                secureTextEntry={!mostrarSenha}
                            />

                            <Pressable
                                onPress={() => setMostrarSenha(!mostrarSenha)}
                                className="px-3 h-full items-center justify-center"
                            >
                                {mostrarSenha ? (
                                    <EyeSlashIcon size={20} color="#718096" />
                                ) : (
                                    <EyeIcon size={20} color="#718096" />
                                )}
                            </Pressable>
                        </View>
                    </View>

                    {/* Redefinir senha */}
                    <View className="w-full flex-row mb-6">
                        <Text className="text-[#405570] dark:text-[#D0D0D5] text-[13px] font-serif">
                            Esqueceu a senha?{" "}
                        </Text>

                        <Link href="/recuperar-senha" asChild>
                            <Text className="text-[#72A8DD] text-[13px] font-serif underline">
                                Redefinir senha
                            </Text>
                        </Link>
                    </View>

                    {/* Botão */}
                    <Pressable
                        onPress={entrar}
                        disabled={carregando}
                        className="w-full h-[55px] bg-[#5EA7ED] rounded-xl items-center justify-center mb-6"
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-[#142338] dark:text-white text-[18px] font-serif">
                                Entrar
                            </Text>
                        )}
                    </Pressable>


                    {emailPendente && (
                        <Pressable
                            onPress={reenviarEmail}
                            disabled={reenviando}
                            className="w-full items-center mb-5"
                        >
                            {reenviando ? (
                                <ActivityIndicator color="#5EA7ED" />
                            ) : (
                                <Text className="text-[#72A8DD] text-sm underline">
                                    Reenviar e-mail de confirmação
                                </Text>
                            )}
                        </Pressable>
                    )}


                    {/* Cadastro */}
                    <View className="w-full flex-row items-center justify-center mb-4">
                        <Text className="text-[#405570] dark:text-[#D0D0D5] text-[13px] font-serif">
                            Não tem uma conta?{" "}
                        </Text>

                        <Link href="/cadastro" asChild>
                            <Text className="text-[#72A8DD] text-[13px] font-serif underline">
                                Criar conta
                            </Text>
                        </Link>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

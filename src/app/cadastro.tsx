
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

import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { EyeIcon, EyeSlashIcon } from "phosphor-react-native";

import { cadastrarUsuario } from "../services/authService";
import Toast from "react-native-toast-message";
import { ApiError } from "@/services/api";

export default function Cadastro() {
    const router = useRouter();

    const [usuario, setUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const emailNormalizado = email.trim().toLowerCase();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);


    async function cadastrar() {
        const username = usuario.trim();
        const emailNormalizado = email.trim().toLowerCase();

        const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const formatoUsuario = /^[a-zA-Z0-9._]{3,20}$/;

        if (!username || !emailNormalizado || !senha || !confirmarSenha) {
            Toast.show({
                type: "error",
                text1: "Campos incompletos",
                text2: "Preencha todos os campos para continuar.",
            });
            return;
        }

        if (!formatoUsuario.test(username)) {
            Toast.show({
                type: "error",
                text1: "Usuário inválido",
                text2: "Use de 3 a 20 caracteres: letras, números, ponto ou underline.",
            });
            return;
        }

        if (!formatoEmail.test(emailNormalizado) || emailNormalizado.length > 254) {
            Toast.show({
                type: "error",
                text1: "E-mail inválido",
                text2: "Digite um endereço de e-mail válido.",
            });
            return;
        }

        if (senha !== confirmarSenha) {
            Toast.show({
                type: "error",
                text1: "Senhas diferentes",
                text2: "Confira se as duas senhas são iguais.",
            });
            return;
        }

        const senhaValida =
            senha.length >= 8 &&
            senha.length <= 128 &&
            /[a-z]/.test(senha) &&
            /[A-Z]/.test(senha) &&
            /[0-9]/.test(senha) &&
            /[^a-zA-Z0-9]/.test(senha);

        if (!senhaValida) {
            Toast.show({
                type: "error",
                text1: "Senha inválida",
                text2: "Use ao menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.",
            });
            return;
        }

        try {
            setCarregando(true);

            await cadastrarUsuario(username, emailNormalizado, senha);

            Toast.show({
                type: "success",
                text1: "Conta criada!",
                text2: "Enviamos um link de confirmação para seu e-mail.",
            });

            router.replace("/login");
        } catch (erro) {
            if (
                erro instanceof ApiError &&
                erro.status === 502 &&
                erro.data?.emailPendente
            ) {
                Toast.show({
                    type: "info",
                    text1: "Conta criada!",
                    text2: "Não conseguimos enviar o e-mail. Entre e solicite um novo envio.",
                });

                router.replace("/login");
                return;
            }
        } finally {
            setCarregando(false);
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
                    <View className="items-center mb-2">
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={{ width: 130, height: 85 }}
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="text-[#142338] dark:text-white text-2xl text-center font-serif">
                        Cadastro
                    </Text>

                    <Text className="text-[#405570] dark:text-[#D0D0D5] text-xs text-center font-serif mt-1 mb-6">
                        Crie sua conta e descubra novas músicas.
                    </Text>

                    <View className="w-full">
                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Usuário
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#EAF1F8] dark:bg-[#0C121D] border border-[#C5D3E1] dark:border-[#354052] rounded-[9px] px-3 text-[#142338] dark:text-white text-[13px] mb-4"
                            value={usuario}
                            onChangeText={setUsuario}
                            placeholder="Usuário"
                            placeholderTextColor="#718096"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            E-mail
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#EAF1F8] dark:bg-[#0C121D] border border-[#C5D3E1] dark:border-[#354052] rounded-[9px] px-3 text-[#142338] dark:text-white text-[13px] mb-4"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="E-mail"
                            placeholderTextColor="#718096"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Senha
                        </Text>

                        <View className="w-full h-12 flex-row items-center bg-[#EAF1F8] dark:bg-[#0C121D] border border-[#C5D3E1] dark:border-[#354052] rounded-[9px] mb-4">
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

                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Confirmar senha
                        </Text>

                        <View className="w-full h-12 flex-row items-center bg-[#EAF1F8] dark:bg-[#0C121D] border border-[#C5D3E1] dark:border-[#354052] rounded-[9px] mb-5">
                            <TextInput
                                className="flex-1 h-full px-3 text-[#142338] dark:text-white text-[13px]"
                                value={confirmarSenha}
                                onChangeText={setConfirmarSenha}
                                placeholder="Confirmar senha"
                                placeholderTextColor="#718096"
                                secureTextEntry={!mostrarConfirmarSenha}
                            />

                        </View>
                    </View>

                    <View className="w-full px-1 mb-5">
                        <Text className="text-[#405570] dark:text-[#D0D0D5] text-xs leading-[18px] font-serif">
                            Ao criar sua conta, você concorda com nossos{" "}
                            <Text className="text-[#142338] dark:text-white underline">
                                Termos de Uso
                            </Text>
                            {" "}e{" "}
                            <Text className="text-[#142338] dark:text-white underline">
                                Política de Privacidade.
                            </Text>
                        </Text>
                    </View>

                    <Pressable
                        onPress={cadastrar}
                        disabled={carregando}
                        className={`w-full h-[52px] bg-[#5EA7ED] rounded-xl items-center justify-center mb-5 ${carregando ? "opacity-70" : ""
                            }`}
                    >
                        {carregando ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text className="text-[#142338] dark:text-white text-[18px] font-serif">
                                Criar conta
                            </Text>
                        )}
                    </Pressable>

                    <View className="w-full flex-row items-center justify-center mb-4">
                        <Text className="text-[#405570] dark:text-[#D0D0D5] text-[13px] font-serif">
                            Já tem uma conta?{" "}
                        </Text>

                        <Link href="/login" asChild>
                            <Text className="text-[#72A8DD] text-[13px] font-serif underline">
                                Entrar
                            </Text>
                        </Link>
                    </View>
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

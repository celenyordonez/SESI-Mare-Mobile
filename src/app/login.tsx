
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

import { fazerLogin } from "../services/authService";
import Toast from "react-native-toast-message";

export default function Login() {
    const router = useRouter();

    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

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

            await fazerLogin(usuario.trim(), senha);

            Toast.show({
                type: "success",
                text1: "Login realizado!",
                text2: "Bem-vindo de volta.",
            });

            router.replace("/home");
        } catch (erro) {
            Toast.show({
                type: "error",
                text1: "Erro ao fazer login",
                text2:
                    erro instanceof Error
                        ? erro.message
                        : "Verifique seus dados e tente novamente.",
            });
        } finally {
            setCarregando(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
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
                    <Text className="text-white text-2xl text-center font-serif">
                        Login
                    </Text>

                    <Text className="text-[#D0D0D5] text-xs text-center font-serif mt-1 mb-6">
                        Bem-vindo de volta! Continue de onde você parou.
                    </Text>

                    {/* Formulário */}
                    <View className="w-full">
                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            E-mail ou usuário
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#171E2B] rounded-[9px] px-[11px] text-white text-[13px] mb-5"
                            value={usuario}
                            onChangeText={setUsuario}
                            placeholder="E-mail ou usuário"
                            placeholderTextColor="#4B4B6B"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Senha
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#171E2B] rounded-[9px] px-[11px] text-white text-[13px] mb-5"
                            value={senha}
                            onChangeText={setSenha}
                            placeholder="Senha"
                            placeholderTextColor="#4B4B6B"
                            secureTextEntry
                        />
                    </View>

                    {/* Redefinir senha */}
                    <View className="w-full flex-row mb-6">
                        <Text className="text-[#D0D0D5] text-[13px] font-serif">
                            Esqueceu a senha?{" "}
                        </Text>

                        <Link href="/login" asChild>
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
                            <Text className="text-white text-[18px] font-serif">
                                Entrar
                            </Text>
                        )}
                    </Pressable>

                    {/* Cadastro */}
                    <View className="w-full flex-row items-center justify-center mb-4">
                        <Text className="text-[#D0D0D5] text-[13px] font-serif">
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
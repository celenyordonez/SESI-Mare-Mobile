
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

import { cadastrarUsuario } from "../services/authService";
import Toast from "react-native-toast-message";

export default function Cadastro() {
    const router = useRouter();

    const [usuario, setUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [carregando, setCarregando] = useState(false);
    const emailNormalizado = email.trim().toLowerCase();
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function cadastrar() {
        if (
            !usuario.trim() ||
            !email.trim() ||
            !senha ||
            !confirmarSenha
        ) {
            Toast.show({
                type: "error",
                text1: "Campos incompletos",
                text2: "Preencha todos os campos para continuar.",
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

        if (!formatoEmail.test(emailNormalizado)) {
            Toast.show({
                type: "error",
                text1: "E-mail inválido",
                text2: "Digite um endereço de e-mail válido.",
            });
            return;
        }

        if (senha.length < 8) {
            Toast.show({
                type: "error",
                text1: "Senha muito curta",
                text2: "A senha deve ter pelo menos 8 caracteres.",
            });
            return;
        }

        try {
            setCarregando(true);

            console.log("1. Iniciando cadastro...");

            await cadastrarUsuario(
                usuario.trim(),
                emailNormalizado,
                senha
            );

            console.log("2. Cadastro concluído!");

            Toast.show({
                type: "success",
                text1: "Conta criada!",
                text2: "Seu cadastro foi concluído com sucesso.",
            });

            router.replace("/login");
        } catch (erro) {
            console.log("3. Erro no cadastro:", erro);

            Toast.show({
                type: "error",
                text1: "Não foi possível cadastrar",
                text2:
                    erro instanceof Error
                        ? erro.message
                        : "Tente novamente.",
            });
        } finally {
            console.log("4. Finalizando cadastro...");
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
                    <View className="items-center mb-2">
                        <Image
                            source={require("../../assets/images/logo.png")}
                            style={{ width: 130, height: 85 }}
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="text-white text-2xl text-center font-serif">
                        Cadastro
                    </Text>

                    <Text className="text-[#D0D0D5] text-xs text-center font-serif mt-1 mb-6">
                        Crie sua conta e descubra novas músicas.
                    </Text>

                    <View className="w-full">
                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Usuário
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#354052] rounded-[9px] px-3 text-white text-[13px] mb-4"
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
                            className="w-full h-12 bg-[#0C121D] border border-[#354052] rounded-[9px] px-3 text-white text-[13px] mb-4"
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

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#354052] rounded-[9px] px-3 text-white text-[13px] mb-4"
                            value={senha}
                            onChangeText={setSenha}
                            placeholder="Senha"
                            placeholderTextColor="#718096"
                            secureTextEntry
                        />

                        <Text className="text-[#EEEEF1] text-sm font-serif mb-1">
                            Confirmar senha
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#354052] rounded-[9px] px-3 text-white text-[13px] mb-5"
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            placeholder="Confirmar senha"
                            placeholderTextColor="#718096"
                            secureTextEntry
                        />
                    </View>

                    <View className="w-full px-1 mb-5">
                        <Text className="text-[#D0D0D5] text-xs leading-[18px] font-serif">
                            Ao criar sua conta, você concorda com nossos{" "}
                            <Text className="text-white underline">
                                Termos de Uso
                            </Text>
                            {" "}e{" "}
                            <Text className="text-white underline">
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
                            <Text className="text-white text-[18px] font-serif">
                                Criar conta
                            </Text>
                        )}
                    </Pressable>

                    <View className="w-full flex-row items-center justify-center mb-4">
                        <Text className="text-[#D0D0D5] text-[13px] font-serif">
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
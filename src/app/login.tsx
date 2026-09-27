import { useState } from "react";

import {
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function Cadastro() {
    const [usuario, setUsuario] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">

            <LinearGradient
                colors={["#080A10", "#1C2E48"]}
                className="flex-1"
                style={{ "minHeight": "100%" }}
            >

                <ScrollView
                    className="flex-1 p-8"
                    showsVerticalScrollIndicator={false}
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

                    <Text className="text-[#D0D0D5] text-xs text-center font-serif mt-1 mb-[35px]">
                        Bem-vindo de volta! Continue de onde você parou.
                    </Text>


                    {/* Formulário */}
                    <View className="w-full mt-8">

                        {/* Usuário */}
                        <Text className="text-[#EEEEF1] text-sm font-serif ml-0.5 mb-1">
                            E-mail ou usuário
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#171E2B] rounded-[9px] px-[11px] text-white text-[13px] mb-[22px]"
                            value={usuario}
                            onChangeText={setUsuario}
                            placeholder="E-mail ou usuário"
                            placeholderTextColor="#4B4B6B"
                            autoCapitalize="none"
                        />


                        {/* E-mail */}
                        <Text className="text-[#EEEEF1] text-sm font-serif ml-0.5 mb-1">
                            Senha
                        </Text>

                        <TextInput
                            className="w-full h-12 bg-[#0C121D] border border-[#171E2B] rounded-[9px] px-[11px] text-white text-[13px] mb-[22px]"
                            value={senha}
                            onChangeText={setSenha}
                            placeholder="Senha"
                            placeholderTextColor="#4B4B6B"
                            secureTextEntry
                        />

                    </View>

                    {/* Redefinir senha */}
                    <View className="w-full flex-row mb-8">

                        <Text className="text-[#D0D0D5] text-[13px] font-serif">
                            Esqueceu a senha?{" "}
                        </Text>

                        <Link href="/login">
                            <Text className="text-[#72A8DD] text-[13px] font-serif underline">
                                Redefinir senha
                            </Text>
                        </Link>

                    </View>

                    {/* Botão */}
                    <Pressable className="w-full h-[55px] bg-[#5EA7ED] rounded-xl items-center justify-center mb-6">

                        <Text className="text-white text-[18px] font-serif">
                            Entrar
                        </Text>

                    </Pressable>


                    {/* Login */}
                    <View className="w-full flex-row items-center justify-center">

                        <Text className="text-[#D0D0D5] text-[13px] font-serif">
                            Não tem uma conta?{" "}
                        </Text>

                        <Link href="/cadastro">
                            <Text className="text-[#72A8DD] text-[13px] font-serif underline">
                                Criar conta
                            </Text>
                        </Link>

                    </View>

                </ScrollView>

            </LinearGradient>

        </SafeAreaView >
    );
}
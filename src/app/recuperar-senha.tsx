import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { ArrowLeftIcon, EnvelopeSimpleIcon, ShieldCheckIcon } from "phosphor-react-native";
import { ApiError } from "../services/api";
import { redefinirSenha, solicitarRedefinicaoSenha } from "../services/authService";

export default function RecuperarSenha() {
    const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
    const token = typeof tokenParam === "string" ? tokenParam : "";
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmacao, setConfirmacao] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    async function enviar() {
        if (!token && !email.trim()) {
            Toast.show({ type: "error", text1: "Informe seu e-mail." });
            return;
        }
        if (token) {
            const valida = senha.length >= 8 && senha.length <= 128 && /[a-z]/.test(senha) && /[A-Z]/.test(senha) && /[0-9]/.test(senha) && /[^a-zA-Z0-9]/.test(senha);
            if (!valida || senha !== confirmacao) {
                Toast.show({ type: "error", text1: senha !== confirmacao ? "As senhas não coincidem." : "A senha precisa ter 8 a 128 caracteres, maiúscula, minúscula, número e símbolo." });
                return;
            }
        }

        setCarregando(true);
        try {
            if (token) {
                const resposta = await redefinirSenha(token, senha);
                Toast.show({ type: "success", text1: resposta.message });
                router.replace("/login");
            } else {
                const resposta = await solicitarRedefinicaoSenha(email.trim().toLowerCase());
                setEnviado(true);
                Toast.show({ type: "success", text1: resposta.message });
            }
        } catch (erro) {
            Toast.show({ type: "error", text1: erro instanceof ApiError ? erro.message : "Não foi possível concluir a solicitação." });
        } finally { setCarregando(false); }
    }

    return <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 28 }} keyboardShouldPersistTaps="handled">
            <View className="w-full max-w-[440px] self-center rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-6">
                <Link href="/login" asChild><Pressable className="flex-row items-center self-start py-2"><ArrowLeftIcon size={18} color="#9AA6BA" /><Text className="ml-2 text-sm text-[#52677F] dark:text-[#9AA6BA]">Voltar ao login</Text></Pressable></Link>
                <Image source={require("../../assets/images/logo.png")} resizeMode="contain" className="w-36 h-20 self-center my-4" />
                <View className="items-center mb-6"><View className="w-12 h-12 rounded-full bg-[#58AAF0]/10 items-center justify-center mb-3">{token ? <ShieldCheckIcon size={24} color="#58AAF0" /> : <EnvelopeSimpleIcon size={24} color="#58AAF0" />}</View>
                    <Text className="text-[#142338] dark:text-white text-xl font-semibold text-center">{token ? "Crie uma nova senha" : "Redefinir senha"}</Text>
                    <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm text-center mt-2">{token ? "Escolha uma senha segura para sua conta." : enviado ? "Enviamos o link de redefinição para o e-mail cadastrado." : "Enviaremos um link para o e-mail da sua conta."}</Text>
                </View>
                {(!enviado || token) ? <View>
                    {!token ? <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="Seu e-mail" placeholderTextColor="#718096" className="h-12 rounded-xl border border-[#C5D3E1] dark:border-[#354052] bg-[#F4F7FA] dark:bg-[#0B1019] px-4 text-[#142338] dark:text-white mb-4" /> : <>
                        <TextInput value={senha} onChangeText={setSenha} secureTextEntry autoComplete="new-password" placeholder="Nova senha" placeholderTextColor="#718096" className="h-12 rounded-xl border border-[#C5D3E1] dark:border-[#354052] bg-[#F4F7FA] dark:bg-[#0B1019] px-4 text-[#142338] dark:text-white mb-3" />
                        <TextInput value={confirmacao} onChangeText={setConfirmacao} secureTextEntry autoComplete="new-password" placeholder="Confirme a nova senha" placeholderTextColor="#718096" className="h-12 rounded-xl border border-[#C5D3E1] dark:border-[#354052] bg-[#F4F7FA] dark:bg-[#0B1019] px-4 text-[#142338] dark:text-white mb-4" />
                    </>}
                    <Pressable onPress={() => void enviar()} disabled={carregando} className="h-[52px] rounded-xl bg-[#5EA7ED] items-center justify-center">{carregando ? <ActivityIndicator color="white" /> : <Text className="text-[#142338] dark:text-white text-base font-semibold">{token ? "Salvar nova senha" : "Enviar link por e-mail"}</Text>}</Pressable>
                </View> : <Pressable onPress={() => router.replace("/login")} className="h-12 border border-[#C5D3E1] dark:border-[#354052] rounded-xl items-center justify-center"><Text className="text-[#142338] dark:text-white">Voltar ao login</Text></Pressable>}
            </View>
        </ScrollView>
    </SafeAreaView>;
}

import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeftIcon } from "phosphor-react-native";
import Topbar from "@/components/topbar";

export default function Criar() {

    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">

            {/* Topo */}
            <Topbar
                titulo="Criar post"
                subtitulo="O que você achou dessa música?"
                tipo="voltar"
            />

            {/* Conteúdo */}
            <View className="flex-1 items-center justify-center">

                <Text className="text-white text-xl">
                    Criar
                </Text>

            </View>

        </SafeAreaView >
    );
}
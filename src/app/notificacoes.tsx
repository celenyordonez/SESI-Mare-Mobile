import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../components/navbar";
import { View, Text } from "react-native";
import Topbar from "@/components/topbar";

export default function Perfil() {
    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">

            {/* Topbar */}
            <Topbar titulo="Notificações" subtitulo="Atualizações e alertas importantes" />

            <View className="flex-1 items-center justify-center">
                <Text className="text-white text-xl">
                    Notificações
                </Text>
            </View>

            <Navbar />
        </SafeAreaView>
    );
}
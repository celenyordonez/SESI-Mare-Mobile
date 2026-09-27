import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text} from "react-native";
import { useRouter } from "expo-router";
import Topbar from "../components/topbar";

export default function Perfil() {

    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">

            {/* Topo */}
            <Topbar
                titulo="Meu perfil"
                subtitulo="Suas músicas e publicações"
                tipo="voltar"
            />


            <View className="flex-1 items-center justify-center">
                <Text className="text-white text-xl">
                    Perfil
                </Text>
            </View>

        </SafeAreaView>
    );
}
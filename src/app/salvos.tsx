import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/** Mantém links antigos e leva a coleção salva para a aba do perfil. */
export default function Salvos() {
    const router = useRouter();

    useEffect(() => {
        router.replace({ pathname: "/perfil", params: { aba: "salvos" } } as never);
    }, [router]);

    return (
        <SafeAreaView className="flex-1 items-center justify-center bg-[#080A10]">
            <View className="items-center justify-center">
                <ActivityIndicator color="#58AAF0" />
            </View>
        </SafeAreaView>
    );
}

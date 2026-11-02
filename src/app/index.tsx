
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "../services/api";
import type { Usuario } from "../types/auth";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
        async function verificarLogin() {
            try {
                const token = await AsyncStorage.getItem("token");

                if (!token) {
                    router.replace("/login");
                    return;
                }

                const usuario = await apiRequest<Usuario>("/usuarios/me", {
                    autenticado: true,
                });

                router.replace(
                    usuario.preferenciasConcluidas ? "/home" : "/filtrar",
                );
            } catch {
                await AsyncStorage.multiRemove(["token", "usuario"]);
                router.replace("/login");
            }
        }

        verificarLogin();
    }, [router]);

    return (
        <View className="flex-1 bg-[#080A10] items-center justify-center">
            <ActivityIndicator size="large" color="#5EA7ED" />
        </View>
    );
}

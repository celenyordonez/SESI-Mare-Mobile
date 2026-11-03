import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { apiRequest } from "./api";

export function configurarExibicaoDePush() {
    if (Platform.OS !== "android") return;
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function verificarPermissaoDePush() {
    if (Platform.OS !== "android") return false;
    const permissao = await Notifications.getPermissionsAsync();
    return permissao.granted || permissao.status === "granted";
}

/** Confere se este token está realmente ativo na conta, sem reativá-lo. */
export async function verificarRegistroPush() {
    if (Platform.OS !== "android" || !(await verificarPermissaoDePush())) return false;

    const projectId =
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId ??
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
    if (!projectId) return false;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const resposta = await apiRequest<{ ativado: boolean }>(
        `/notificacoes/push-token?token=${encodeURIComponent(token)}`,
        { autenticado: true },
    );
    return resposta.ativado;
}

/** Pede autorização, registra o token Expo e o associa à conta autenticada. */
export async function ativarNotificacoesPush() {
    if (Platform.OS !== "android") {
        throw new Error("As notificações push estão configuradas para Android.");
    }
    if (!Device.isDevice) {
        throw new Error("Use um aparelho Android para ativar as notificações.");
    }

    await Notifications.setNotificationChannelAsync("mare-atividade", {
        name: "Atividade na Maré",
        description: "Curtidas, comentários, seguidores e mensagens.",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 180, 120, 180],
        lightColor: "#58AAF0",
    });

    let permissao = await Notifications.getPermissionsAsync();
    if (!permissao.granted && permissao.status !== "granted") {
        permissao = await Notifications.requestPermissionsAsync();
    }
    if (!permissao.granted && permissao.status !== "granted") {
        throw new Error("Permita notificações para a Maré nas configurações do Android.");
    }

    const projectId =
        Constants.easConfig?.projectId ??
        Constants.expoConfig?.extra?.eas?.projectId ??
        process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

    if (!projectId) {
        throw new Error("O projeto Expo ainda precisa ser vinculado ao EAS para registrar notificações.");
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    await apiRequest("/notificacoes/push-token", {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ token, plataforma: "android" }),
    });

    return token;
}

/** Remove o token do servidor ao desativar as push ou sair da conta. */
export async function removerTokenPushDoServidor() {
    if (Platform.OS !== "android") return;
    try {
        const projectId =
            Constants.easConfig?.projectId ??
            Constants.expoConfig?.extra?.eas?.projectId ??
            process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
        if (!projectId) return;

        const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        await apiRequest("/notificacoes/push-token", {
            method: "DELETE",
            autenticado: true,
            body: JSON.stringify({ token }),
        });
    } catch (erro) {
        // A saída da conta continua mesmo sem conexão para remover o token.
        console.warn("Não foi possível remover o token push do servidor:", erro);
    }
}

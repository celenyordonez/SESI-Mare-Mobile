import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import { apiRequest } from "./api";

const CHAVE_PUSH_PERGUNTADO = "mare:push:permissao-perguntada";
const CHAVE_PUSH_DESATIVADO_MANUALMENTE = "mare:push:desativado-manualmente";

export function configurarExibicaoDePush() {
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
    const permissao = await Notifications.getPermissionsAsync();
    return permissao.granted || permissao.status === "granted";
}

/** Confere se este token está realmente ativo na conta, sem reativá-lo. */
export async function verificarRegistroPush() {
    if (!(await verificarPermissaoDePush())) return false;

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
    if (!Device.isDevice) {
        throw new Error("Use um aparelho físico para ativar as notificações.");
    }

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("mare-atividade", {
            name: "Atividade na Maré",
            description: "Curtidas, comentários, seguidores e mensagens.",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 180, 120, 180],
            lightColor: "#58AAF0",
        });
    }

    let permissao = await Notifications.getPermissionsAsync();
    if (!permissao.granted && permissao.status !== "granted") {
        // Evita abrir o pedido do sistema em todos os logins caso a pessoa recuse.
        await AsyncStorage.setItem(CHAVE_PUSH_PERGUNTADO, "sim");
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
        body: JSON.stringify({ token, plataforma: Platform.OS === "ios" ? "ios" : "android" }),
    });

    await AsyncStorage.multiSet([
        [CHAVE_PUSH_PERGUNTADO, "sim"],
        [CHAVE_PUSH_DESATIVADO_MANUALMENTE, "nao"],
    ]);

    return token;
}

/** Ativa push automaticamente apenas na primeira sessão, respeitando a escolha de desligar. */
export async function ativarPushPadraoNoLogin() {
    const [jaPerguntado, desativadoManualmente] = await AsyncStorage.multiGet([
        CHAVE_PUSH_PERGUNTADO,
        CHAVE_PUSH_DESATIVADO_MANUALMENTE,
    ]);
    if (desativadoManualmente[1] === "sim") return;
    // Uma permissão já concedida é registrada de novo após cada login/saída da conta.
    if (await verificarPermissaoDePush()) {
        await ativarNotificacoesPush();
        return;
    }
    if (jaPerguntado[1] === "sim") return;
    await ativarNotificacoesPush();
}

/** Desliga o push neste aparelho e preserva a escolha nos próximos logins. */
export async function desativarNotificacoesPush() {
    await AsyncStorage.setItem(CHAVE_PUSH_DESATIVADO_MANUALMENTE, "sim");
    await removerTokenPushDoServidor();
}

/** Remove o token do servidor ao desativar as push ou sair da conta. */
export async function removerTokenPushDoServidor() {
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

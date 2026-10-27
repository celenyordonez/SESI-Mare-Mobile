
import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "./api";
import type {
    CadastroResponse,
    LoginResponse,
} from "../types/auth";

export async function fazerLogin(
    login: string,
    senha: string
) {
    const dados = await apiRequest<LoginResponse>("/login", {
        method: "POST",
        body: JSON.stringify({ login, senha }),
    });

    await AsyncStorage.setItem("token", dados.token);
    await AsyncStorage.setItem(
        "usuario",
        JSON.stringify(dados.usuario)
    );

    return dados;
}

export async function cadastrarUsuario(
    username: string,
    email: string,
    senha: string
) {
    return apiRequest<CadastroResponse>("/usuarios", {
        method: "POST",
        body: JSON.stringify({ username, email, senha }),
    });
}

export async function fazerLogout() {
    await AsyncStorage.multiRemove(["token", "usuario"]);
}

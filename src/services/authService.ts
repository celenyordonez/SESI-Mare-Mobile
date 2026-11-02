
import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "./api";
import { invalidarCacheSalvos } from "./salvamentoService";
import { invalidarCacheFotoPerfil } from "./perfilCache";
import type {
    CadastroResponse,
    LoginResponse,
    ReenvioVerificacaoResponse,
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
    invalidarCacheSalvos();
    invalidarCacheFotoPerfil();
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

export async function reenviarVerificacao(login: string) {
    return apiRequest<ReenvioVerificacaoResponse>(
        "/usuarios/reenviar-verificacao",
        {
            method: "POST",
            body: JSON.stringify({ login }),
        }
    );
}

export async function solicitarRedefinicaoSenha(email: string) {
    return apiRequest<{ message: string }>("/usuarios/recuperar-senha", {
        method: "POST",
        body: JSON.stringify({ email }),
    });
}

export async function redefinirSenha(token: string, senha: string) {
    return apiRequest<{ message: string }>("/usuarios/redefinir-senha", {
        method: "POST",
        body: JSON.stringify({ token, senha }),
    });
}

export async function fazerLogout() {
    await AsyncStorage.multiRemove(["token", "usuario"]);
    invalidarCacheSalvos();
    invalidarCacheFotoPerfil();
}

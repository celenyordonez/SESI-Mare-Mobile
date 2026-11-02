
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

if (!API_URL) {
    throw new Error("Configure EXPO_PUBLIC_API_URL no arquivo .env");
}

type ApiOptions = RequestInit & {
    autenticado?: boolean;
};

export class ApiError extends Error {
    code: string;
    status: number;
    data: any;

    constructor(
        code: string,
        message: string,
        status: number,
        data: any
    ) {
        super(message);
        this.name = "ApiError";
        this.code = code;
        this.status = status;
        this.data = data;
    }
}

function interpretarResposta<T>(status: number, texto: string): T {
    let dados: any = null;
    try {
        dados = texto ? JSON.parse(texto) : null;
    } catch {
        dados = null;
    }

    if (status < 200 || status >= 300) {
        throw new ApiError(
            dados?.error || dados?.erro || "ERRO_API",
            dados?.message || dados?.error || dados?.erro ||
                `Erro na requisição (${status})`,
            status,
            dados,
        );
    }

    return dados as T;
}

function enviarFormularioNativo<T>(
    url: string,
    metodo: string,
    formulario: FormData,
    cabecalhos: HeadersInit,
): Promise<T> {
    return new Promise((resolver, rejeitar) => {
        const requisicao = new XMLHttpRequest();
        requisicao.open(metodo, url);

        new Headers(cabecalhos).forEach((valor, nome) => {
            requisicao.setRequestHeader(nome, valor);
        });

        requisicao.onload = () => {
            try {
                resolver(interpretarResposta<T>(requisicao.status, requisicao.responseText));
            } catch (erro) {
                rejeitar(erro);
            }
        };
        requisicao.onerror = () => {
            rejeitar(new ApiError("ERRO_REDE", "Não foi possível conectar ao servidor.", 0, null));
        };

        // No Android/iOS, o XHR entende o formato de arquivo local do FormData nativo.
        // O fetch do Expo SDK 58 não reconhece essa parte URI.
        requisicao.send(formulario);
    });
}

export async function apiRequest<T>(
    rota: string,
    options: ApiOptions = {}
): Promise<T> {
    const { autenticado = false, headers, ...rest } = options;

    const token = autenticado
        ? await AsyncStorage.getItem("token")
        : null;
    const corpoEhFormulario =
        typeof FormData !== "undefined" && rest.body instanceof FormData;

    const cabecalhos: HeadersInit = {
        ...(!corpoEhFormulario ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
    };

    if (corpoEhFormulario && Platform.OS !== "web") {
        return enviarFormularioNativo<T>(
            `${API_URL}${rota}`,
            rest.method ?? "GET",
            rest.body as FormData,
            cabecalhos,
        );
    }

    const response = await fetch(`${API_URL}${rota}`, {
        ...rest,
        headers: cabecalhos,
    });

    const dados = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(
            dados?.error || dados?.erro || "ERRO_API",
            dados?.message || dados?.error || dados?.erro ||
                `Erro na requisição (${response.status})`,
            response.status,
            dados
        );
    }

    return dados as T;
}

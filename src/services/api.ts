
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    const response = await fetch(`${API_URL}${rota}`, {
        ...rest,
        headers: {
            ...(!corpoEhFormulario ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
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

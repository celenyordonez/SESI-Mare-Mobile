import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("Configure EXPO_PUBLIC_API_URL no arquivo .env");
}

type ApiOptions = RequestInit & {
    autenticado?: boolean;
};

export async function apiRequest<T>(
    rota: string,
    options: ApiOptions = {}
): Promise<T> {
    const { autenticado = false, headers, ...rest } = options;

    const token = autenticado
        ? await AsyncStorage.getItem("token")
        : null;

    const response = await fetch(`${API_URL}${rota}`, {
        ...rest,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
    });

    const dados = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            dados?.error ||
            dados?.erro ||
            `Erro na requisição (${response.status})`
        );
    }

    return dados as T;
}
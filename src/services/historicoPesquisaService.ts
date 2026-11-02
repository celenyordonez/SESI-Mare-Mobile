import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_HISTORICO_PESQUISA = "mare:historico-pesquisa:v1";
const LIMITE_HISTORICO = 8;

function normalizar(termo: string) {
    return termo.trim().toLocaleLowerCase("pt-BR");
}

export async function buscarHistoricoPesquisa(): Promise<string[]> {
    try {
        const salvo = await AsyncStorage.getItem(CHAVE_HISTORICO_PESQUISA);
        const dados: unknown = salvo ? JSON.parse(salvo) : [];
        return Array.isArray(dados)
            ? dados.filter((termo): termo is string => typeof termo === "string").slice(0, LIMITE_HISTORICO)
            : [];
    } catch (erro) {
        console.warn("Não foi possível carregar o histórico de pesquisa.", erro);
        return [];
    }
}

export async function registrarPesquisa(termo: string): Promise<string[]> {
    const consulta = termo.trim();
    if (!consulta) return buscarHistoricoPesquisa();

    const atual = await buscarHistoricoPesquisa();
    const atualizado = [consulta, ...atual.filter((item) => normalizar(item) !== normalizar(consulta))]
        .slice(0, LIMITE_HISTORICO);
    await AsyncStorage.setItem(CHAVE_HISTORICO_PESQUISA, JSON.stringify(atualizado));
    return atualizado;
}

export async function removerPesquisaDoHistorico(termo: string): Promise<string[]> {
    const atual = await buscarHistoricoPesquisa();
    const atualizado = atual.filter((item) => normalizar(item) !== normalizar(termo));
    await AsyncStorage.setItem(CHAVE_HISTORICO_PESQUISA, JSON.stringify(atualizado));
    return atualizado;
}

export async function limparHistoricoPesquisa(): Promise<void> {
    await AsyncStorage.removeItem(CHAVE_HISTORICO_PESQUISA);
}

import { apiRequest } from "./api";

type ItemSalvo = { musica?: { id: number } };

let idsSalvos: Set<number> | null = null;
let buscaEmAndamento: Promise<Set<number>> | null = null;
let versaoCache = 0;

export function invalidarCacheSalvos() {
    versaoCache += 1;
    idsSalvos = null;
    buscaEmAndamento = null;
}

export async function buscarIdsSalvos(): Promise<Set<number>> {
    if (idsSalvos) return idsSalvos;
    if (!buscaEmAndamento) {
        const versaoAtual = versaoCache;
        const requisicao = apiRequest<ItemSalvo[]>("/usuarios/me/salvos", { autenticado: true })
            .then((items) => {
                const ids = new Set((Array.isArray(items) ? items : [])
                    .map((item) => item.musica?.id)
                    .filter((id): id is number => typeof id === "number"));
                if (versaoCache === versaoAtual) idsSalvos = ids;
                return ids;
            })
            .finally(() => { if (buscaEmAndamento === requisicao) buscaEmAndamento = null; });
        buscaEmAndamento = requisicao;
    }
    return buscaEmAndamento;
}

export async function alternarSalvamentoMusica(id: number, salva: boolean) {
    await buscarIdsSalvos().catch(() => null);
    await apiRequest(`/musicas/${id}/salvar`, {
        method: salva ? "DELETE" : "POST",
        autenticado: true,
    });
    if (idsSalvos) {
        if (salva) idsSalvos.delete(id);
        else idsSalvos.add(id);
    }
}

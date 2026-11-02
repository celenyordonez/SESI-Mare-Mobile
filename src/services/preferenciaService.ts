import { apiRequest } from "./api";

export type PreferenciasNotificacao = {
    curtidas: boolean;
    comentarios: boolean;
    seguidores: boolean;
};

type ListaGeneros = { generos: string[] };

// Obtém os gêneros disponíveis no catálogo musical.
export async function buscarGenerosDisponiveis(): Promise<string[]> {
    const resposta = await apiRequest<ListaGeneros | string[]>("/musicas/generos");
    return Array.isArray(resposta) ? resposta : resposta.generos;
}

// Salva as preferências e marca o cadastro inicial como concluído no servidor.
export function salvarGenerosFavoritos(generos: string[]) {
    return apiRequest<{ message: string; generos: string[] }>("/usuarios/me/generos", {
        method: "PUT",
        autenticado: true,
        body: JSON.stringify({ generos }),
    });
}

// O endpoint adiciona artistas favoritos e evita duplicatas no servidor.
export function salvarArtistasFavoritos(artistaIds: number[]) {
    return apiRequest<{ message: string }>("/usuarios/me/artistas", {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ artistaIds }),
    });
}

export function buscarPreferenciasNotificacao() {
    return apiRequest<PreferenciasNotificacao>(
        "/usuarios/me/notificacoes/preferencias",
        { autenticado: true },
    );
}

export function salvarPreferenciasNotificacao(
    preferencias: PreferenciasNotificacao,
) {
    return apiRequest<PreferenciasNotificacao>(
        "/usuarios/me/notificacoes/preferencias",
        {
            method: "PUT",
            autenticado: true,
            body: JSON.stringify(preferencias),
        },
    );
}

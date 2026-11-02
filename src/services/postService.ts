import { apiRequest } from "./api";

export type Post = {
    id: number;
    texto: string | null;
    nota: number;
    dataCriacao: string;
    editado?: boolean;
    curtidoPorMim?: boolean;
    usuario?: { id: number; nome?: string | null; username?: string; foto?: string | null };
    musica?: {
        id: number; titulo: string; capa?: string | null; duracaoSegundos?: number;
        genero?: string | null; nota?: number; avaliacoes?: number;
        artista?: { id: number; nome: string; fotoURL?: string | null };
        spotifyUrl?: string | null; appleMusicUrl?: string | null;
        amazonMusicUrl?: string | null; youtubeMusicUrl?: string | null;
    };
    _count?: { curtidas: number; comentarios: number };
};

export type AvaliacaoDados = { musicaId: number; nota: number; texto: string };
export type EditarAvaliacaoDados = { texto: string | null; nota: number };

export function buscarPosts(rota = "/posts") {
    return apiRequest<Post[]>(rota, { autenticado: true });
}

export function buscarPostPorId(id: number) {
    return apiRequest<Post>(`/posts/${id}`, { autenticado: true });
}

export function criarPost(dados: AvaliacaoDados) {
    return apiRequest<Post>("/posts", { method: "POST", autenticado: true, body: JSON.stringify(dados) });
}

export function editarPost(id: number, dados: EditarAvaliacaoDados) {
    return apiRequest<Post>(`/posts/${id}`, { method: "PATCH", autenticado: true, body: JSON.stringify(dados) });
}

export async function excluirPost(id: number) {
    await apiRequest<void>(`/posts/${id}`, { method: "DELETE", autenticado: true });
}

export function alternarCurtidaPost(id: number, curtido: boolean) {
    return apiRequest(`/posts/${id}/curtir`, { method: curtido ? "DELETE" : "POST", autenticado: true });
}

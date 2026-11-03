import { apiRequest } from "./api";

export type Comentario = {
    id: number; texto: string; dataCriacao: string; editado?: boolean;
    respostaAId?: number | null; curtidoPorMim?: boolean;
    _count?: { curtidas?: number };
    profundidade?: number;
    respondendoA?: { nome: string; username?: string };
    usuario: { id: number; nome: string; username?: string; foto?: string | null };
    respostas?: Comentario[];
};

export function buscarComentarios(postId: number) {
    return apiRequest<Comentario[]>(`/posts/${postId}/comentarios`, { autenticado: true });
}
export function criarComentario(postId: number, texto: string, respostaAId?: number) {
    return apiRequest<Comentario>(`/posts/${postId}/comentarios`, {
        method: "POST", autenticado: true,
        body: JSON.stringify({ texto, ...(respostaAId == null ? {} : { respostaAId }) }),
    });
}
export function editarComentario(id: number, texto: string) {
    return apiRequest(`/comentarios/${id}`, { method: "PATCH", autenticado: true, body: JSON.stringify({ texto }) });
}
export function excluirComentario(id: number) {
    return apiRequest(`/comentarios/${id}`, { method: "DELETE", autenticado: true });
}
export function alternarCurtidaComentario(id: number, curtido: boolean) {
    return apiRequest(`/comentarios/${id}/curtir`, { method: curtido ? "DELETE" : "POST", autenticado: true });
}

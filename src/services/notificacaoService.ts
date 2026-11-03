import { apiRequest } from "./api";

export type Notificacao = {
    id: number; tipo: string; mensagem: string; lida: boolean; criadaEm: string;
    usuario?: { id: number; nome: string; username: string; foto: string | null } | null;
    postId?: number | null; musicaId?: number | null; textoComentario?: string | null;
    post?: { id: number; texto: string | null; nota: number; editado?: boolean; usuario?: { id: number; nome: string; username: string; foto: string | null } | null; musica?: { id: number; titulo: string; capa?: string | null; artista?: { nome: string } } | null } | null;
    musica?: { id: number; titulo: string; capa?: string | null; artista?: { nome: string } } | null;
};

export function buscarNotificacoes() { return apiRequest<Notificacao[]>("/notificacoes", { autenticado: true }); }
export function buscarQuantidadeNotificacoesNaoLidas() { return apiRequest<{ quantidade: number }>("/notificacoes/nao-lidas/quantidade", { autenticado: true }); }
export function marcarNotificacaoLida(id: number) { return apiRequest(`/notificacoes/${id}/lida`, { method: "PATCH", autenticado: true }); }
export function marcarTodasNotificacoesLidas() { return apiRequest("/notificacoes/lidas", { method: "PATCH", autenticado: true }); }
export function limparNotificacoes() { return apiRequest<{ mensagem: string; quantidade: number }>("/notificacoes", { method: "DELETE", autenticado: true }); }

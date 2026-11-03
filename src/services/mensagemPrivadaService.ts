import { apiRequest } from "./api";

export type PessoaConversa = {
    id: number;
    nome: string;
    username: string;
    foto?: string | null;
};

export type MensagemPrivada = {
    id: number;
    conversaId: number;
    remetenteId: number;
    texto: string;
    criadaEm: string;
    lidaEm?: string | null;
    remetente: PessoaConversa;
};

export type ConversaPrivada = {
    id: number;
    criadaEm: string;
    atualizadaEm: string;
    outroUsuario: PessoaConversa;
    ultimaMensagem: Pick<MensagemPrivada, "id" | "texto" | "remetenteId" | "criadaEm" | "lidaEm"> | null;
    mensagensNaoLidas: number;
};

export function buscarConversas() {
    return apiRequest<ConversaPrivada[]>("/conversas", { autenticado: true });
}

export function iniciarConversa(usuarioId: number) {
    return apiRequest<ConversaPrivada>("/conversas", {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ usuarioId }),
    });
}

export function buscarMensagens(conversaId: number, depoisDe?: number) {
    const cursor = depoisDe ? `?depoisDe=${depoisDe}` : "";
    return apiRequest<MensagemPrivada[]>(`/conversas/${conversaId}/mensagens${cursor}`, { autenticado: true });
}

export function enviarMensagem(conversaId: number, texto: string) {
    return apiRequest<MensagemPrivada>(`/conversas/${conversaId}/mensagens`, {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ texto }),
    });
}

export function marcarConversaComoLida(conversaId: number) {
    return apiRequest<{ atualizadas: number }>(`/conversas/${conversaId}/lidas`, {
        method: "PATCH",
        autenticado: true,
    });
}

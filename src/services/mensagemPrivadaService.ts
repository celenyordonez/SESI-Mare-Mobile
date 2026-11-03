import { apiRequest } from "./api";

export type PessoaConversa = {
    id: number;
    nome: string;
    username: string;
    foto?: string | null;
};

export type MusicaCompartilhada = {
    id: number;
    titulo: string;
    capa?: string | null;
    artista: { id: number; nome: string };
};

export type MensagemPrivada = {
    id: number;
    conversaId: number;
    remetenteId: number;
    texto: string;
    criadaEm: string;
    lidaEm?: string | null;
    remetente: PessoaConversa;
    musica?: MusicaCompartilhada | null;
};

export type ConversaPrivada = {
    id: number;
    criadaEm: string;
    atualizadaEm: string;
    outroUsuario: PessoaConversa;
    ultimaMensagem: Pick<MensagemPrivada, "id" | "texto" | "remetenteId" | "criadaEm" | "lidaEm"> | null;
    mensagensNaoLidas: number;
    silenciadaPorMim: boolean;
    bloqueadaPorMim: boolean;
    bloqueadaPeloOutro: boolean;
};

export function buscarConversas() {
    return apiRequest<ConversaPrivada[]>("/conversas", { autenticado: true });
}

export function buscarQuantidadeMensagensNaoLidas() {
    return apiRequest<{ quantidade: number }>("/conversas/nao-lidas/quantidade", { autenticado: true });
}

export function iniciarConversa(usuarioId: number) {
    return apiRequest<ConversaPrivada>("/conversas", {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ usuarioId }),
    });
}

export function buscarDetalhesConversa(conversaId: number) {
    return apiRequest<Pick<ConversaPrivada, "id" | "silenciadaPorMim" | "bloqueadaPorMim" | "bloqueadaPeloOutro">>(
        `/conversas/${conversaId}`,
        { autenticado: true },
    );
}

export function atualizarConfiguracoesConversa(
    conversaId: number,
    configuracao: { silenciada?: boolean; bloqueada?: boolean },
) {
    return apiRequest<Pick<ConversaPrivada, "silenciadaPorMim" | "bloqueadaPorMim" | "bloqueadaPeloOutro">>(
        `/conversas/${conversaId}/configuracoes`,
        {
            method: "PATCH",
            autenticado: true,
            body: JSON.stringify(configuracao),
        },
    );
}

export function buscarMensagens(conversaId: number, depoisDe?: number) {
    const cursor = depoisDe ? `?depoisDe=${depoisDe}` : "";
    return apiRequest<MensagemPrivada[]>(`/conversas/${conversaId}/mensagens${cursor}`, { autenticado: true });
}

export function buscarIdsMensagensLidas(conversaId: number) {
    return apiRequest<{ ids: number[] }>(`/conversas/${conversaId}/leituras`, { autenticado: true });
}

export function enviarMensagem(conversaId: number, texto: string) {
    return apiRequest<MensagemPrivada>(`/conversas/${conversaId}/mensagens`, {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ texto }),
    });
}

export function compartilharMusica(conversaId: number, musicaId: number) {
    return apiRequest<MensagemPrivada>(`/conversas/${conversaId}/mensagens`, {
        method: "POST",
        autenticado: true,
        body: JSON.stringify({ musicaId }),
    });
}

export function marcarConversaComoLida(conversaId: number) {
    return apiRequest<{ atualizadas: number }>(`/conversas/${conversaId}/lidas`, {
        method: "PATCH",
        autenticado: true,
    });
}

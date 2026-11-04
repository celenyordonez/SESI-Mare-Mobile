import { apiRequest } from "./api";
import type { Post } from "./postService";
import type { Musica } from "./musicaService";

export type UsuarioBusca = { id: number; nome: string; username: string; foto?: string | null };
export type MeuPerfil = {
    id: number; nome: string; username: string; email?: string; foto?: string | null;
    capa?: string | null; bio?: string | null; preferenciasConcluidas?: boolean;
    _count?: { seguidores: number; seguindo: number; posts: number; comentarios?: number; salvamentos?: number };
};
export type PerfilPublico = Omit<MeuPerfil, "_count"> & { _count: { seguidores: number; seguindo: number; posts: number }; seguindoPorMim: boolean; segueDeVolta: boolean; posts: Post[] };
export type ArtistaFavorito = { artistaId: number };
export type ComentarioPerfil = {
    id: number;
    texto: string;
    dataCriacao: string;
    usuario?: UsuarioBusca;
    post?: Post | null;
};
export type RelacaoUsuario = {
    seguidor?: UsuarioBusca;
    seguido?: UsuarioBusca;
};
export type DadosEdicaoPerfil = { nome: string; username: string; bio: string };
export type Seguindo = { seguido: { id: number } };

export function buscarUsuarios(termo?: string) {
    const busca = termo?.trim();
    const consulta = busca ? `?search=${encodeURIComponent(busca)}` : "";
    return apiRequest<UsuarioBusca[]>(`/usuarios${consulta}`);
}
export function buscarMeuPerfil() { return apiRequest<MeuPerfil>("/usuarios/me", { autenticado: true }); }
export function buscarPerfilPublico(username: string) {
    return apiRequest<PerfilPublico>(`/usuarios/publico/${encodeURIComponent(username)}`, { autenticado: true });
}
export function buscarPostsDoUsuario() { return apiRequest<Post[]>("/usuarios/me/posts", { autenticado: true }); }
export function buscarPostsCurtidos() { return apiRequest<Post[]>("/usuarios/me/curtidas", { autenticado: true }); }
export function buscarMusicasSalvas() { return apiRequest<{ musica: Musica }[]>("/usuarios/me/salvos", { autenticado: true }); }
export function buscarComentariosDoUsuario<T>() { return apiRequest<T[]>("/usuarios/me/comentarios", { autenticado: true }); }
export function buscarComentariosPublicos(usuarioId: number) {
    return apiRequest<ComentarioPerfil[]>(`/usuarios/${usuarioId}/comentarios`);
}
export function buscarGenerosFavoritos() { return apiRequest<string[]>("/usuarios/me/generos", { autenticado: true }); }
export function buscarArtistasFavoritos() { return apiRequest<ArtistaFavorito[]>("/usuarios/me/artistas", { autenticado: true }); }
export function buscarSeguindo(usuarioId: number) { return apiRequest<Seguindo[]>(`/usuarios/${usuarioId}/seguindo`, { autenticado: true }); }
export function alternarSeguirUsuario(id: number, seguindo: boolean) {
    return apiRequest(`/usuarios/${id}/seguir`, { method: seguindo ? "DELETE" : "POST", autenticado: true });
}
export function buscarSeguidores(usuarioId: number) {
    return apiRequest<RelacaoUsuario[]>(`/usuarios/${usuarioId}/seguidores`);
}
export function buscarListaSeguindo(usuarioId: number) {
    return apiRequest<RelacaoUsuario[]>(`/usuarios/${usuarioId}/seguindo`);
}
export function atualizarMeuPerfil(dados: DadosEdicaoPerfil) {
    return apiRequest<MeuPerfil>("/usuarios/me", {
        method: "PUT",
        autenticado: true,
        body: JSON.stringify(dados),
    });
}
export function enviarImagemDoPerfil(formulario: FormData) {
    return apiRequest<{ foto: string | null; capa: string | null }>("/usuarios/me/imagem", {
        method: "PATCH",
        autenticado: true,
        body: formulario,
    });
}
export function removerImagemDoPerfil(tipo: "foto" | "capa") {
    return apiRequest<{ foto: string | null; capa: string | null }>("/usuarios/me/imagem", {
        method: "DELETE",
        autenticado: true,
        body: JSON.stringify({ tipo }),
    });
}
export function excluirMinhaConta() {
    return apiRequest<{ message: string }>("/usuarios/me", {
        method: "DELETE",
        autenticado: true,
    });
}
export function solicitarTrocaEmail(novoEmail: string, senhaAtual: string) {
    return apiRequest<{ message: string }>("/usuarios/me/email", {
        method: "PATCH", autenticado: true, body: JSON.stringify({ novoEmail, senhaAtual }),
    });
}
export function alterarMinhaSenha(senhaAtual: string, novaSenha: string) {
    return apiRequest<{ message: string }>("/usuarios/me/senha", {
        method: "PATCH", autenticado: true, body: JSON.stringify({ senhaAtual, novaSenha }),
    });
}

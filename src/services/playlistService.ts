import { apiRequest } from "./api";

export type Playlist = {
    id: number;
    nome: string;
    descricao: string | null;
    publica: boolean;
    usuario: { id: number; nome: string; username: string; foto?: string | null };
    musicas: { musica: { id: number; titulo: string; capa?: string | null; genero: string; artista: { id: number; nome: string } } }[];
};

export const buscarMinhasPlaylists = () => apiRequest<Playlist[]>("/usuarios/me/playlists", { autenticado: true });
export const buscarPlaylistsPublicas = (username: string) => apiRequest<Playlist[]>(`/usuarios/publico/${encodeURIComponent(username)}/playlists`, { autenticado: true });
export const criarPlaylist = (nome: string, descricao = "", publica = false) => apiRequest<Playlist>("/playlists", { method: "POST", autenticado: true, body: JSON.stringify({ nome, descricao, publica }) });
export const atualizarPlaylist = (id: number, dados: Partial<Pick<Playlist, "nome" | "descricao" | "publica">>) => apiRequest<Playlist>(`/playlists/${id}`, { method: "PATCH", autenticado: true, body: JSON.stringify(dados) });
export const adicionarMusicaPlaylist = (id: number, musicaId: number) => apiRequest<Playlist>(`/playlists/${id}/musicas`, { method: "POST", autenticado: true, body: JSON.stringify({ musicaId }) });
export const removerMusicaPlaylist = (id: number, musicaId: number) => apiRequest<void>(`/playlists/${id}/musicas/${musicaId}`, { method: "DELETE", autenticado: true });
export const excluirPlaylist = (id: number) => apiRequest<void>(`/playlists/${id}`, { method: "DELETE", autenticado: true });
export const compartilharPlaylist = (conversaId: number, playlistId: number) => apiRequest(`/conversas/${conversaId}/mensagens`, { method: "POST", autenticado: true, body: JSON.stringify({ playlistId }) });

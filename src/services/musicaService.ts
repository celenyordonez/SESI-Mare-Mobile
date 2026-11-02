import { apiRequest } from "./api";
import type { Post } from "./postService";

export type Musica = {
    id: number;
    titulo: string;
    genero?: string | null;
    capa?: string | null;
    duracaoSegundos?: number;
    nota?: number;
    avaliacoes?: number;
    artista?: { id: number; nome: string; fotoURL?: string | null };
    spotifyUrl?: string | null;
    appleMusicUrl?: string | null;
    amazonMusicUrl?: string | null;
    youtubeMusicUrl?: string | null;
    _count?: { posts?: number };
};

export function buscarMusicas() {
    return apiRequest<Musica[]>("/musicas");
}

export function buscarMusicaPorId(id: number) {
    return apiRequest<Musica>(`/musicas/${id}`, { autenticado: true });
}

export function buscarPostsDaMusica(id: number) {
    return apiRequest<Post[]>(`/posts?musicaId=${id}`, { autenticado: true });
}

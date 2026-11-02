import { apiRequest } from "./api";
import type { Musica } from "./musicaService";

export type Artista = { id: number; nome: string; fotoURL?: string | null; musicas?: Musica[] };

export function buscarArtistas() {
    return apiRequest<Artista[]>("/artistas");
}

export function buscarArtistaPorId(id: number) {
    return apiRequest<Artista>(`/artistas/${id}`);
}

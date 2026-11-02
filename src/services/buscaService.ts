import { apiRequest } from "./api";
import type { Artista } from "./artistaService";
import type { Musica } from "./musicaService";
import type { Post } from "./postService";
import type { ArtistaFavorito, UsuarioBusca } from "./usuarioService";

export type DadosBusca = {
    musicas: Musica[];
    artistas: Artista[];
    posts: Post[];
    usuarios: UsuarioBusca[];
    generosFavoritos: string[];
    artistasFavoritos: ArtistaFavorito[];
    usuarioLogadoId: number;
};

export async function buscarDadosBusca(): Promise<DadosBusca> {
    const [musicas, artistas, posts, usuarios, generosFavoritos, artistasFavoritos, usuario] = await Promise.all([
        apiRequest<Musica[]>("/musicas"),
        apiRequest<Artista[]>("/artistas"),
        apiRequest<Post[]>("/posts", { autenticado: true }),
        apiRequest<UsuarioBusca[]>("/usuarios"),
        apiRequest<string[]>("/usuarios/me/generos", { autenticado: true }).catch(() => []),
        apiRequest<ArtistaFavorito[]>("/usuarios/me/artistas", { autenticado: true }).catch(() => []),
        apiRequest<{ id: number }>("/usuarios/me", { autenticado: true }),
    ]);
    return { musicas, artistas, posts, usuarios, generosFavoritos, artistasFavoritos, usuarioLogadoId: usuario.id };
}

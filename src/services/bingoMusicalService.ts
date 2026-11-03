import type { Musica } from "./musicaService";
import type { Post } from "./postService";

export type DesafioBingo = {
    id: string;
    titulo: string;
    concluido: boolean;
    destino: "avaliar" | "salvos";
};

/** Monta a cartela apenas com ações que o perfil e a coleção já registram. */
export function montarCartelaBingo(
    avaliacoes: Post[],
    musicasSalvas: { musica: Musica }[],
    catalogo: Musica[],
): DesafioBingo[] {
    const musicaPorId = new Map(catalogo.map((musica) => [musica.id, musica]));
    const idsMusicasAvaliadas = new Set(
        avaliacoes.map((post) => post.musica?.id).filter((id): id is number => id != null),
    );
    const idsArtistasAvaliados = new Set(
        avaliacoes
            .map((post) => post.musica?.artista?.id)
            .filter((id): id is number => id != null),
    );
    const generosAvaliados = new Set(
        avaliacoes
            .map((post) => {
                const musica = post.musica?.id != null ? musicaPorId.get(post.musica.id) : undefined;
                return (post.musica?.genero ?? musica?.genero)?.trim().toLocaleLowerCase("pt-BR");
            })
            .filter((genero): genero is string => Boolean(genero)),
    );
    const quantidadeSalvas = new Set(
        musicasSalvas.map((item) => item.musica.id).filter((id) => Number.isFinite(id)),
    ).size;
    const temTexto = avaliacoes.some((post) => Boolean(post.texto?.trim()));
    const deuNotaMaxima = avaliacoes.some((post) => post.nota >= 5);

    return [
        { id: "avalie-uma", titulo: "Avalie uma música", concluido: idsMusicasAvaliadas.size >= 1, destino: "avaliar" },
        { id: "avalie-tres", titulo: "Avalie 3 músicas", concluido: idsMusicasAvaliadas.size >= 3, destino: "avaliar" },
        { id: "avalie-cinco", titulo: "Avalie 5 músicas", concluido: idsMusicasAvaliadas.size >= 5, destino: "avaliar" },
        { id: "texto", titulo: "Escreva uma avaliação", concluido: temTexto, destino: "avaliar" },
        { id: "artistas", titulo: "Avalie 2 artistas", concluido: idsArtistasAvaliados.size >= 2, destino: "avaliar" },
        { id: "generos", titulo: "Avalie 3 gêneros", concluido: generosAvaliados.size >= 3, destino: "avaliar" },
        { id: "salve-uma", titulo: "Salve uma música", concluido: quantidadeSalvas >= 1, destino: "salvos" },
        { id: "salve-tres", titulo: "Salve 3 músicas", concluido: quantidadeSalvas >= 3, destino: "salvos" },
        { id: "nota-maxima", titulo: "Dê nota 5 a uma música", concluido: deuNotaMaxima, destino: "avaliar" },
    ];
}

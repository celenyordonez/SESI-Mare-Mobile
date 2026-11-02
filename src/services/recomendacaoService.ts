import { ApiError, apiRequest } from "./api";
import { buscarMusicas, type Musica } from "./musicaService";
import { buscarPostsDoUsuario } from "./usuarioService";

export type MusicaDoDia = {
    musica: (Musica & { _count?: { posts: number } }) | null;
    dia: string;
    personalizada: boolean;
};

// O backend escolhe uma música nova para a pessoa e mantém a indicação estável no dia.
export function buscarMusicaDoDia() {
    return apiRequest<MusicaDoDia>("/recomendacoes/do-dia", { autenticado: true });
}

export function buscarMusicasRecomendadas() {
    return apiRequest<(Musica & { _count?: { posts: number } })[]>(
        "/musicas/recomendadas",
        { autenticado: true },
    );
}

/** Retorna uma cópia da lista em ordem aleatória, sem alterar a resposta original. */
export function embaralharLista<T>(lista: readonly T[]): T[] {
    const resultado = [...lista];
    for (let indice = resultado.length - 1; indice > 0; indice -= 1) {
        const aleatorio = Math.floor(Math.random() * (indice + 1));
        [resultado[indice], resultado[aleatorio]] = [resultado[aleatorio], resultado[indice]];
    }
    return resultado;
}

/** Usa recomendações pessoais; se não houver nenhuma, abre o catálogo real restante. */
export async function buscarMusicasParaDescoberta() {
    try {
        const recomendadas = await buscarMusicasRecomendadas();
        if (recomendadas.length > 0) return embaralharLista(recomendadas);
    } catch (erro) {
        // 404 pode ocorrer enquanto o backend do Render está sendo atualizado.
        if (!(erro instanceof ApiError) || erro.status !== 404) throw erro;
    }

    const [catalogo, posts] = await Promise.all([
        buscarMusicas(),
        buscarPostsDoUsuario(),
    ]);
    const idsAvaliados = new Set(
        posts.map((post) => post.musica?.id).filter((id): id is number => id != null),
    );

    const candidatas = catalogo
        .filter((musica) => !idsAvaliados.has(musica.id))
        .sort((a, b) =>
            (b.avaliacoes ?? b._count?.posts ?? 0) - (a.avaliacoes ?? a._count?.posts ?? 0) ||
            (b.nota ?? 0) - (a.nota ?? 0) ||
            a.id - b.id,
        )
        .slice(0, 50);

    return embaralharLista(candidatas);
}

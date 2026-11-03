import type { Musica } from "./musicaService";
import { embaralharLista } from "./recomendacaoService";

export type MomentoMusicalId = "feliz" | "tranquilo" | "nostalgico" | "animado" | "reflexivo";

export type MomentoMusical = {
    id: MomentoMusicalId;
    titulo: string;
    descricao: string;
    simbolo: string;
    generos: string[];
    cor: string;
};

/** Associa cada momento a gêneros que podem aparecer no catálogo da Maré. */
export const momentosMusicais: MomentoMusical[] = [
    {
        id: "feliz",
        titulo: "Feliz",
        descricao: "Sons leves e cheios de energia",
        simbolo: "☀️",
        generos: ["pop", "dance", "funk", "samba", "axé", "disco", "reggaeton"],
        cor: "#F5C879",
    },
    {
        id: "tranquilo",
        titulo: "Tranquilo",
        descricao: "Para desacelerar um pouco",
        simbolo: "🌿",
        generos: ["ambient", "acoustic", "acústico", "jazz", "bossa nova", "lo-fi", "classical", "clássica", "mpb"],
        cor: "#83D9C9",
    },
    {
        id: "nostalgico",
        titulo: "Nostálgico",
        descricao: "Músicas que trazem lembranças",
        simbolo: "🌙",
        generos: ["mpb", "rock", "soul", "disco", "oldies", "sertanejo", "samba", "pop"],
        cor: "#B9A1FF",
    },
    {
        id: "animado",
        titulo: "Animado",
        descricao: "Um impulso para continuar",
        simbolo: "⚡",
        generos: ["funk", "eletrônica", "electronic", "dance", "hip hop", "hip-hop", "rap", "rock", "pop"],
        cor: "#FF9A8B",
    },
    {
        id: "reflexivo",
        titulo: "Reflexivo",
        descricao: "Para ouvir com calma e atenção",
        simbolo: "💭",
        generos: ["mpb", "indie", "alternativo", "alternative", "jazz", "soul", "acoustic", "acústico", "classical", "ambient"],
        cor: "#8CC8FF",
    },
];

function normalizar(texto: string) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

/** Filtra apenas faixas cujo gênero cadastrado combina com o momento escolhido. */
export function buscarFaixasDoMomento(catalogo: Musica[], momento: MomentoMusical) {
    const generosDoMomento = momento.generos.map(normalizar);
    const correspondentes = catalogo.filter((musica) => {
        if (!musica.genero?.trim()) return false;
        const genero = normalizar(musica.genero);
        return generosDoMomento.some((termo) => genero.includes(termo));
    });

    return embaralharLista(correspondentes);
}

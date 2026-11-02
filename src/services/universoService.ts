import { apiRequest } from "./api";

export type EstatisticasUniverso = {
    totalAvaliacoes: number;
    totalMusicasSalvas: number;
    totalGeneros: number;
    mediaGeral: number;
    distribuicao: { nota: number; quantidade: number }[];
    generos: { nome: string; quantidade: number }[];
    artistas: {
        id: number;
        nome: string;
        fotoURL: string | null;
        quantidade: number;
    }[];
    trajetoria?: { mes: string; quantidade: number }[];
};

// Recebe estatísticas já agrupadas pelo backend, sem baixar o histórico completo.
export function buscarEstatisticasUniverso() {
    return apiRequest<EstatisticasUniverso>("/usuarios/me/universo", {
        autenticado: true,
    });
}

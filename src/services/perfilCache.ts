import { apiRequest } from "./api";

type UsuarioResumo = { foto?: string | null };

let fotoPerfilEmCache: string | null | undefined;
let requisicaoPerfil: Promise<string | null> | null = null;
let versaoCache = 0;

export function invalidarCacheFotoPerfil() {
    versaoCache += 1;
    fotoPerfilEmCache = undefined;
    requisicaoPerfil = null;
}

export async function buscarFotoPerfil(): Promise<string | null> {
    if (fotoPerfilEmCache !== undefined) return fotoPerfilEmCache;
    if (!requisicaoPerfil) {
        const versaoAtual = versaoCache;
        const requisicao = apiRequest<UsuarioResumo>("/usuarios/me", { autenticado: true })
            .then((usuario) => {
                const foto = usuario.foto ?? null;
                if (versaoCache === versaoAtual) fotoPerfilEmCache = foto;
                return foto;
            })
            .catch((error) => {
                console.error("Erro ao carregar foto do perfil:", error);
                return null;
            })
            .finally(() => { if (requisicaoPerfil === requisicao) requisicaoPerfil = null; });
        requisicaoPerfil = requisicao;
    }
    return requisicaoPerfil;
}

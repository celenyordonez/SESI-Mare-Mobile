// Links públicos do frontend web da Maré usados nos compartilhamentos nativos.
const URL_WEB_MARE = "https://mare-amber.vercel.app";

export function linkPerfil(username: string) {
    return `${URL_WEB_MARE}/u/${encodeURIComponent(username)}`;
}

export function linkMusica(musicaId: number) {
    return `${URL_WEB_MARE}/musica/${musicaId}`;
}

export function linkArtista(artistaId: number) {
    return `${URL_WEB_MARE}/artista/${artistaId}`;
}

export function linkPost(postId: number) {
    return `${URL_WEB_MARE}/post/${postId}`;
}

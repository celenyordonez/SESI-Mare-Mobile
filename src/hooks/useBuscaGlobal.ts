import { useCallback, useEffect, useMemo, useState } from "react";
import { buscarDadosBusca, type DadosBusca } from "../services/buscaService";

const dadosVazios: DadosBusca = {
    musicas: [], artistas: [], posts: [], usuarios: [], generosFavoritos: [], artistasFavoritos: [], usuarioLogadoId: 0,
};

function normalizar(valor: unknown) {
    return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export function useBuscaGlobal(termo: string) {
    const [dados, setDados] = useState(dadosVazios);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    const recarregar = useCallback(async () => {
        setCarregando(true);
        try { setDados(await buscarDadosBusca()); setErro(false); }
        catch (error) { console.error("Erro ao carregar pesquisa:", error); setErro(true); }
        finally { setCarregando(false); }
    }, []);

    useEffect(() => { void recarregar(); }, [recarregar]);

    const q = normalizar(termo.trim());
    const resultados = useMemo(() => ({
        musicas: q ? dados.musicas.filter((item) => normalizar(item.titulo).includes(q) || normalizar(item.artista?.nome).includes(q)) : [],
        artistas: q ? dados.artistas.filter((item) => normalizar(item.nome).includes(q)) : [],
        usuarios: q ? dados.usuarios.filter((item) => normalizar(item.nome).includes(q) || normalizar(item.username).includes(q)) : [],
        posts: q ? dados.posts.filter((item) => item.musica?.id != null && (normalizar(item.texto).includes(q) || normalizar(item.usuario?.nome).includes(q) || normalizar(item.usuario?.username).includes(q) || normalizar(item.musica?.titulo).includes(q) || normalizar(item.musica?.artista?.nome).includes(q))) : [],
    }), [q, dados]);

    return { ...dados, resultados, carregando, erro, buscando: !!q, recarregar };
}

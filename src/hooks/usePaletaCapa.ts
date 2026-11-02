import { useEffect, useState } from "react";

import { buscarPaletaCapa, type PaletaCapa } from "../services/paletaCapaService";

/** Carrega a paleta uma vez por capa e ignora respostas de imagens anteriores. */
export function usePaletaCapa(uri?: string | null) {
    const [paleta, setPaleta] = useState<PaletaCapa | null>(null);

    useEffect(() => {
        let ativo = true;
        setPaleta(null);
        if (!uri) return () => { ativo = false; };

        void buscarPaletaCapa(uri)
            .then((resultado) => {
                if (ativo) setPaleta(resultado);
            })
            .catch(() => {
                if (ativo) setPaleta(null);
            });

        return () => {
            ativo = false;
        };
    }, [uri]);

    return paleta;
}

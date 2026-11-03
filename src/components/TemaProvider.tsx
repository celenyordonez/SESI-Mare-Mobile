import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";

export type PreferenciaTema = "sistema" | "escuro" | "claro";

type ContextoTema = {
    preferenciaTema: PreferenciaTema;
    temaCarregado: boolean;
    alterarTema: (tema: PreferenciaTema) => Promise<void>;
};

const CHAVE_TEMA = "mare-tema";
const contextoTema = createContext<ContextoTema | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
    const { setColorScheme } = useColorScheme();
    const [preferenciaTema, setPreferenciaTema] = useState<PreferenciaTema>("escuro");
    const [temaCarregado, setTemaCarregado] = useState(false);

    const aplicarTema = useCallback((tema: PreferenciaTema) => {
        setColorScheme(tema === "sistema" ? "system" : tema === "claro" ? "light" : "dark");
    }, [setColorScheme]);

    useEffect(() => {
        let ativo = true;
        void AsyncStorage.getItem(CHAVE_TEMA)
            .then((salvo) => {
                const tema: PreferenciaTema = salvo === "sistema" || salvo === "claro" || salvo === "escuro"
                    ? salvo
                    : "escuro";
                if (!ativo) return;
                setPreferenciaTema(tema);
                aplicarTema(tema);
            })
            .catch(() => aplicarTema("escuro"))
            .finally(() => { if (ativo) setTemaCarregado(true); });
        return () => { ativo = false; };
    }, [aplicarTema]);

    const alterarTema = useCallback(async (tema: PreferenciaTema) => {
        setPreferenciaTema(tema);
        aplicarTema(tema);
        await AsyncStorage.setItem(CHAVE_TEMA, tema);
    }, [aplicarTema]);

    const valor = useMemo(
        () => ({ preferenciaTema, temaCarregado, alterarTema }),
        [preferenciaTema, temaCarregado, alterarTema],
    );

    return <contextoTema.Provider value={valor}>{children}</contextoTema.Provider>;
}

export function useTema() {
    const tema = useContext(contextoTema);
    if (!tema) throw new Error("useTema precisa ser usado dentro de TemaProvider.");
    return tema;
}

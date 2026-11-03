import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname } from "expo-router";
import { AppState, type AppStateStatus } from "react-native";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { buscarQuantidadeMensagensNaoLidas } from "../services/mensagemPrivadaService";
import { buscarQuantidadeNotificacoesNaoLidas } from "../services/notificacaoService";

type ContadoresNavegacao = {
    notificacoesNaoLidas: number;
    mensagensNaoLidas: number;
    atualizarContadores: () => Promise<void>;
};

const ContextoContadores = createContext<ContadoresNavegacao>({
    notificacoesNaoLidas: 0,
    mensagensNaoLidas: 0,
    atualizarContadores: async () => undefined,
});

/** Mantém uma única atualização leve para os badges da barra superior e da navbar. */
export function ContadoresNavegacaoProvider({ children }: PropsWithChildren) {
    const pathname = usePathname();
    const [notificacoesNaoLidas, setNotificacoesNaoLidas] = useState(0);
    const [mensagensNaoLidas, setMensagensNaoLidas] = useState(0);

    const atualizarContadores = useCallback(async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            setNotificacoesNaoLidas(0);
            setMensagensNaoLidas(0);
            return;
        }

        const [notificacoes, mensagens] = await Promise.allSettled([
            buscarQuantidadeNotificacoesNaoLidas(),
            buscarQuantidadeMensagensNaoLidas(),
        ]);
        if (notificacoes.status === "fulfilled") {
            setNotificacoesNaoLidas(Math.max(0, notificacoes.value.quantidade || 0));
        }
        if (mensagens.status === "fulfilled") {
            setMensagensNaoLidas(Math.max(0, mensagens.value.quantidade || 0));
        }
    }, []);

    useEffect(() => {
        void atualizarContadores();
        const intervalo = setInterval(() => void atualizarContadores(), 30_000);
        const aoMudarEstado = (estado: AppStateStatus) => {
            if (estado === "active") void atualizarContadores();
        };
        const ouvinte = AppState.addEventListener("change", aoMudarEstado);
        return () => {
            clearInterval(intervalo);
            ouvinte.remove();
        };
    }, [atualizarContadores, pathname]);

    const valor = useMemo(
        () => ({ notificacoesNaoLidas, mensagensNaoLidas, atualizarContadores }),
        [notificacoesNaoLidas, mensagensNaoLidas, atualizarContadores],
    );

    return <ContextoContadores.Provider value={valor}>{children}</ContextoContadores.Provider>;
}

export function useContadoresNavegacao() {
    return useContext(ContextoContadores);
}

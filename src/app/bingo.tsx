import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { CheckCircleIcon, CircleIcon, TrophyIcon } from "phosphor-react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import { montarCartelaBingo, type DesafioBingo } from "../services/bingoMusicalService";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { buscarPostsDoUsuario } from "../services/usuarioService";
import type { Post } from "../services/postService";
import { buscarMusicasSalvas } from "../services/usuarioService";
import { feedbackSelecao } from "../services/feedbackTatil";

const linhasBingo = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
];

export default function BingoMusical() {
    const router = useRouter();
    const { width: larguraTela } = useWindowDimensions();
    const [cartela, setCartela] = useState<DesafioBingo[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState(false);
    const [chaveAtualizacao, setChaveAtualizacao] = useState(0);

    useFocusEffect(useCallback(() => {
        let ativo = true;
        setErro(false);
        setCarregando(true);
        Promise.all([buscarPostsDoUsuario(), buscarMusicasSalvas(), buscarMusicas()])
            .then(([avaliacoes, salvas, catalogo]: [Post[], { musica: Musica }[], Musica[]]) => {
                if (ativo) setCartela(montarCartelaBingo(avaliacoes, salvas, catalogo));
            })
            .catch((erroCarga) => {
                console.error("Erro ao atualizar a cartela do Bingo Musical:", erroCarga);
                if (ativo) setErro(true);
            })
            .finally(() => {
                if (ativo) {
                    setCarregando(false);
                    setAtualizando(false);
                }
            });

        return () => { ativo = false; };
    }, [chaveAtualizacao]));

    const concluidos = useMemo(() => cartela.filter((desafio) => desafio.concluido).length, [cartela]);
    const temBingo = useMemo(
        () => linhasBingo.some((linha) => linha.every((indice) => cartela[indice]?.concluido)),
        [cartela],
    );

    function atualizarCartela() {
        feedbackSelecao();
        setAtualizando(true);
        setChaveAtualizacao((chave) => chave + 1);
    }

    function abrirDesafio(desafio: DesafioBingo) {
        feedbackSelecao();
        if (desafio.destino === "salvos") {
            router.push({ pathname: "/perfil", params: { aba: "salvos" } } as never);
            return;
        }
        router.push("/criar");
    }

    const larguraCelula = (larguraTela - 48 - 16) / 3;

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar tipo="voltar" titulo="Bingo musical" subtitulo="Complete a cartela com suas descobertas" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizarCartela} tintColor="#FFB77A" colors={["#FFB77A"]} />}
            >
                <View className="mb-5 mt-1 flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-[#FFB77A]/30 bg-[#FFB77A]/10">
                        <TrophyIcon size={21} color="#FFB77A" weight="fill" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-serif text-2xl text-white">Seu bingo musical</Text>
                        <Text className="mt-1 text-sm text-[#9AA5B5]">A cartela acompanha sua atividade na Maré</Text>
                    </View>
                </View>

                <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-[#252D3C] bg-[#111420] p-4">
                    <View className="flex-1 pr-3">
                        <Text className="text-sm font-semibold text-white">{concluidos} de {cartela.length || 9} desafios concluídos</Text>
                        <Text className="mt-1 text-xs leading-4 text-[#9AA5B5]">Avaliações e músicas salvas atualizam os quadrados.</Text>
                    </View>
                    <Pressable onPress={atualizarCartela} accessibilityRole="button" accessibilityLabel="Atualizar cartela do bingo" className="rounded-full bg-[#1B2231] px-3 py-2">
                        <Text className="text-xs font-semibold text-[#FFB77A]">Atualizar</Text>
                    </Pressable>
                </View>

                {temBingo ? (
                    <View className="mb-4 flex-row items-center rounded-2xl border border-[#FFB77A]/35 bg-[#FFB77A]/10 p-4">
                        <TrophyIcon size={23} color="#FFB77A" weight="fill" />
                        <View className="ml-3 flex-1">
                            <Text className="font-serif text-lg text-white">Bingo!</Text>
                            <Text className="mt-1 text-xs text-[#D0D8E4]">Você completou uma linha de desafios.</Text>
                        </View>
                    </View>
                ) : null}

                {carregando ? (
                    <View className="py-12"><ActivityIndicator color="#FFB77A" /></View>
                ) : erro ? (
                    <View className="rounded-2xl border border-[#252D3C] bg-[#111420] p-5">
                        <Text className="text-sm leading-5 text-[#D0D8E4]">Não foi possível conferir seu progresso. Puxe para atualizar.</Text>
                    </View>
                ) : (
                    <View className="flex-row flex-wrap justify-between">
                        {cartela.map((desafio) => (
                            <Pressable
                                key={desafio.id}
                                onPress={() => abrirDesafio(desafio)}
                                accessibilityRole="button"
                                accessibilityLabel={`${desafio.titulo}. ${desafio.concluido ? "Concluído" : "Pendente"}`}
                                accessibilityState={{ selected: desafio.concluido }}
                                style={{ width: larguraCelula, aspectRatio: 1, borderColor: desafio.concluido ? "rgba(131,217,201,0.6)" : "#252D3C" }}
                                className={`mb-2 items-center justify-center rounded-2xl border p-2 ${desafio.concluido ? "bg-[#11231F]" : "bg-[#111420]"}`}
                            >
                                {desafio.concluido
                                    ? <CheckCircleIcon size={24} color="#83D9C9" weight="fill" />
                                    : <CircleIcon size={23} color="#647086" />}
                                <Text className={`mt-2 text-center text-[11px] leading-4 ${desafio.concluido ? "text-white" : "text-[#C4CAD5]"}`} numberOfLines={3}>{desafio.titulo}</Text>
                                <Text className={`mt-1 text-[9px] font-semibold tracking-[0.7px] ${desafio.concluido ? "text-[#83D9C9]" : "text-[#718096]"}`}>
                                    {desafio.concluido ? "CONCLUÍDO" : "TOQUE PARA FAZER"}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                <Text className="mt-3 text-center text-[11px] leading-4 text-[#718096]">
                    O progresso é baseado nas avaliações e músicas salvas do seu perfil.
                </Text>
            </ScrollView>
            <Navbar />
        </SafeAreaView>
    );
}

import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowsLeftRightIcon, CheckIcon, TrophyIcon } from "phosphor-react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { embaralharLista } from "../services/recomendacaoService";
import { feedbackAcao, feedbackSelecao } from "../services/feedbackTatil";
import { usePaletaCapa } from "../hooks/usePaletaCapa";
import { corComOpacidade } from "../services/paletaCapaService";

const capaPadrao = require("../../assets/images/logo.png");

type Duelo = [Musica, Musica];
const limiteDuelo = 5;

function chaveDoDuelo(primeira: Musica, segunda: Musica) {
    return [primeira.id, segunda.id].sort((a, b) => a - b).join(":");
}

function criarDuelo(musicas: Musica[], duelosAnteriores: Set<string>): Duelo | null {
    if (musicas.length < 2) return null;

    const misturadas = embaralharLista(musicas);
    for (let primeira = 0; primeira < misturadas.length - 1; primeira += 1) {
        for (let segunda = primeira + 1; segunda < misturadas.length; segunda += 1) {
            const par: Duelo = [misturadas[primeira], misturadas[segunda]];
            if (!duelosAnteriores.has(chaveDoDuelo(par[0], par[1]))) return par;
        }
    }

    // Se a pessoa já enfrentou todos os pares possíveis, inicia uma nova sessão de pares.
    duelosAnteriores.clear();
    const par: Duelo = [misturadas[0], misturadas[1]];
    return par;
}

export default function DueloMusical() {
    const router = useRouter();
    const duelosAnteriores = useRef(new Set<string>());
    const [musicas, setMusicas] = useState<Musica[]>([]);
    const [dueloAtual, setDueloAtual] = useState<Duelo | null>(null);
    const [vitorias, setVitorias] = useState<Record<number, number>>({});
    const [vencedoraId, setVencedoraId] = useState<number | null>(null);
    const [duelosFeitos, setDuelosFeitos] = useState(0);
    const [totalDuelo, setTotalDuelo] = useState(limiteDuelo);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const [verResumo, setVerResumo] = useState(false);
    const paletaPrimeira = usePaletaCapa(dueloAtual?.[0]?.capa);
    const paletaSegunda = usePaletaCapa(dueloAtual?.[1]?.capa);

    useEffect(() => {
        let ativo = true;
        void buscarMusicas()
            .then((catalogo) => {
                if (!ativo) return;
                setMusicas(catalogo);
                const maximoDuelo = Math.min(
                    limiteDuelo,
                    Math.floor((catalogo.length * (catalogo.length - 1)) / 2),
                );
                setTotalDuelo(maximoDuelo);
                const primeiroDuelo = criarDuelo(catalogo, duelosAnteriores.current);
                if (primeiroDuelo) {
                    duelosAnteriores.current.add(chaveDoDuelo(primeiroDuelo[0], primeiroDuelo[1]));
                    setDueloAtual(primeiroDuelo);
                }
            })
            .catch((erroCatalogo) => {
                console.error("Erro ao carregar as músicas para o Duelo Musical:", erroCatalogo);
                setErro(true);
            })
            .finally(() => { if (ativo) setCarregando(false); });

        return () => { ativo = false; };
    }, []);

    function escolherVencedora(musica: Musica) {
        if (vencedoraId !== null) return;
        setVencedoraId(musica.id);
        setDuelosFeitos((quantidade) => quantidade + 1);
        setVitorias((atuais) => ({ ...atuais, [musica.id]: (atuais[musica.id] ?? 0) + 1 }));
        feedbackAcao();
    }

    function avancar() {
        if (duelosFeitos >= totalDuelo) {
            setVerResumo(true);
            return;
        }

        const proximoDuelo = criarDuelo(musicas, duelosAnteriores.current);
        if (!proximoDuelo) {
            setVerResumo(true);
            return;
        }

        duelosAnteriores.current.add(chaveDoDuelo(proximoDuelo[0], proximoDuelo[1]));
        setDueloAtual(proximoDuelo);
        setVencedoraId(null);
        feedbackSelecao();
    }

    function jogarDeNovo() {
        duelosAnteriores.current.clear();
        const primeiroDuelo = criarDuelo(musicas, duelosAnteriores.current);
        if (!primeiroDuelo) return;
        duelosAnteriores.current.add(chaveDoDuelo(primeiroDuelo[0], primeiroDuelo[1]));
        setDueloAtual(primeiroDuelo);
        setVitorias({});
        setVencedoraId(null);
        setDuelosFeitos(0);
        setVerResumo(false);
        feedbackSelecao();
    }

    const favoritas = Object.entries(vitorias)
        .map(([id, quantidade]) => ({ musica: musicas.find((item) => item.id === Number(id)), quantidade }))
        .filter((item): item is { musica: Musica; quantidade: number } => item.musica != null)
        .sort((a, b) => b.quantidade - a.quantidade)
        .slice(0, 3);

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" titulo="Duelo musical" subtitulo="Escolha a sua favorita" />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View className="mb-5 mt-1 flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-[#B9A1FF]/30 bg-[#B9A1FF]/10">
                        <ArrowsLeftRightIcon size={21} color="#B9A1FF" weight="bold" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-serif text-2xl text-[#142338] dark:text-white">Qual você prefere?</Text>
                        <Text className="mt-1 text-sm text-[#52677F] dark:text-[#9AA5B5]">Duelo rápido com músicas do catálogo</Text>
                    </View>
                </View>

                {carregando ? (
                    <View className="h-72 items-center justify-center rounded-3xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420]"><ActivityIndicator color="#B9A1FF" /></View>
                ) : erro ? (
                    <View className="rounded-3xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-6">
                        <Text className="font-serif text-xl text-[#142338] dark:text-white">Não foi possível carregar o duelo</Text>
                        <Pressable onPress={() => router.replace("/explorar")} className="mt-5 self-start rounded-full bg-[#1C314B] px-5 py-3">
                            <Text className="text-sm font-semibold text-[#142338] dark:text-white">Voltar para Explorar</Text>
                        </Pressable>
                    </View>
                ) : verResumo ? (
                    <View>
                        <View className="mb-5 items-center rounded-3xl border border-[#B9A1FF]/30 bg-white dark:bg-[#111420] p-6">
                            <TrophyIcon size={34} color="#B9A1FF" weight="fill" />
                            <Text className="mt-3 text-center font-serif text-2xl text-[#142338] dark:text-white">Suas favoritas da sessão</Text>
                            <Text className="mt-1 text-center text-sm text-[#52677F] dark:text-[#9AA5B5]">Você escolheu entre {duelosFeitos} pares de músicas.</Text>
                        </View>
                        {favoritas.length > 0 ? favoritas.map(({ musica, quantidade }, indice) => (
                            <Pressable
                                key={musica.id}
                                onPress={() => router.push(`/musica/${musica.id}` as never)}
                                className="mb-3 flex-row items-center rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-3"
                            >
                                <Text className="w-8 font-serif text-xl text-[#B9A1FF]">{indice + 1}</Text>
                                <ImageBackground
                                    source={musica.capa ? { uri: musica.capa } : capaPadrao}
                                    className="h-14 w-14 overflow-hidden rounded-xl"
                                    imageStyle={{ borderRadius: 12 }}
                                />
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{musica.titulo}</Text>
                                    <Text className="mt-1 text-xs text-[#52677F] dark:text-[#9AA5B5]" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                                </View>
                                <Text className="ml-2 text-xs text-[#B9A1FF]">{quantidade} {quantidade === 1 ? "vitória" : "vitórias"}</Text>
                            </Pressable>
                        )) : <Text className="py-6 text-center text-sm text-[#52677F] dark:text-[#9AA5B5]">Ainda não há resultados nesta sessão.</Text>}
                        <Pressable onPress={jogarDeNovo} className="mt-3 h-12 items-center justify-center rounded-full bg-[#B9A1FF]">
                            <Text className="font-semibold text-[#171229]">Jogar de novo</Text>
                        </Pressable>
                    </View>
                ) : dueloAtual ? (
                    <>
                        <View className="mb-3 flex-row items-center justify-between">
                            <Text className="text-xs font-medium text-[#52677F] dark:text-[#9AA5B5]">Duelo {Math.min(duelosFeitos + 1, totalDuelo)} de {totalDuelo}</Text>
                            <Text className="text-xs text-[#B9A1FF]">{duelosFeitos} escolhidos</Text>
                        </View>
                        <View className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#202636]">
                            <View className="h-full rounded-full bg-[#B9A1FF]" style={{ width: `${totalDuelo ? (duelosFeitos / totalDuelo) * 100 : 0}%` }} />
                        </View>
                        <View className="flex-row">
                            {dueloAtual.map((musica, indice) => {
                                const escolhida = vencedoraId === musica.id;
                                const perdedora = vencedoraId !== null && !escolhida;
                                const paleta = indice === 0 ? paletaPrimeira : paletaSegunda;
                                const corAcento = paleta?.acento ?? "#B9A1FF";
                                const corDominante = paleta?.dominante ?? "#B9A1FF";
                                return (
                                    <Pressable
                                        key={musica.id}
                                        onPress={() => escolherVencedora(musica)}
                                        disabled={vencedoraId !== null}
                                        className={`mr-3 flex-1 overflow-hidden rounded-2xl border bg-white dark:bg-[#111420] ${escolhida ? "border-[#B9A1FF]" : "border-[#D5E0EC] dark:border-[#252D3C]"}`}
                                        style={{
                                            opacity: perdedora ? 0.55 : 1,
                                            borderColor: corComOpacidade(corAcento, escolhida ? 0.95 : 0.58),
                                            shadowColor: corDominante,
                                            shadowOpacity: escolhida ? 0.4 : 0.2,
                                            shadowRadius: escolhida ? 18 : 12,
                                            shadowOffset: { width: 0, height: 4 },
                                            elevation: escolhida ? 6 : 3,
                                        }}
                                    >
                                        <ImageBackground
                                            source={musica.capa ? { uri: musica.capa } : capaPadrao}
                                            resizeMode="cover"
                                            className="h-[190px] justify-end"
                                        >
                                            <LinearGradient
                                                pointerEvents="none"
                                                colors={["rgba(5,7,12,0.02)", "rgba(5,7,12,0.24)", "rgba(5,7,12,0.92)"]}
                                                locations={[0, 0.48, 1]}
                                                style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
                                            />
                                            <View pointerEvents="none" className="absolute left-0 right-0 top-0 h-[3px]" style={{ backgroundColor: corComOpacidade(corAcento, 0.92) }} />
                                            {escolhida ? <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-[#B9A1FF]"><CheckIcon size={18} color="#171229" weight="bold" /></View> : null}
                                            <View className="p-3">
                                                <Text className="font-serif text-base leading-5 text-[#142338] dark:text-white" numberOfLines={2}>{musica.titulo}</Text>
                                                <Text className="mt-1 text-xs text-[#405570] dark:text-[#D0D8E4]" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                                                {musica.genero ? <Text className="mt-1 text-[10px]" style={{ color: corAcento }} numberOfLines={1}>{musica.genero}</Text> : null}
                                            </View>
                                        </ImageBackground>
                                        <View className="h-10 items-center justify-center">
                                            <Text className="text-xs font-semibold text-[#405570] dark:text-[#D0D8E4]">{escolhida ? "Sua escolha" : "Escolher"}</Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                        <View className="my-4 items-center"><Text className="font-serif text-xs text-[#52677F] dark:text-[#718096]">OU</Text></View>
                        {vencedoraId !== null ? (
                            <Pressable onPress={avancar} className="h-12 flex-row items-center justify-center rounded-full bg-[#B9A1FF]">
                                <Text className="font-semibold text-[#171229]">{duelosFeitos >= totalDuelo ? "Ver suas favoritas" : "Próximo duelo"}</Text>
                            </Pressable>
                        ) : (
                            <Pressable onPress={() => { feedbackSelecao(); router.push("/explorar"); }} className="h-12 items-center justify-center rounded-full border border-[#C5D3E1] dark:border-[#31394A] bg-[#F4F7FA] dark:bg-[#171E2B]">
                                <Text className="text-sm font-semibold text-[#142338] dark:text-white">Sair do duelo</Text>
                            </Pressable>
                        )}
                    </>
                ) : (
                    <View className="rounded-3xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-6">
                        <Text className="font-serif text-xl text-[#142338] dark:text-white">Ainda não há músicas suficientes para um duelo.</Text>
                    </View>
                )}
            </ScrollView>
            <Navbar />
        </SafeAreaView>
    );
}

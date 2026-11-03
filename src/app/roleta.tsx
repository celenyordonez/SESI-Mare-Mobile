import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Easing,
    ImageBackground,
    Pressable,
    ScrollView,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    ArrowRightIcon,
    BookmarkSimpleIcon,
    DiceFiveIcon,
    StarIcon,
} from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import FotoArtista from "../components/FotoArtista";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { alternarSalvamentoMusica, buscarIdsSalvos } from "../services/salvamentoService";
import { feedbackAcao, feedbackSelecao } from "../services/feedbackTatil";

const capaPadrao = require("../../assets/images/logo.png");

/** Sorteia uma música do catálogo para ajudar a pessoa a descobrir algo novo. */
export default function Roleta() {
    const router = useRouter();
    const { width: larguraTela } = useWindowDimensions();
    const larguraDaJanela = Math.max(0, larguraTela - 48);
    const tamanhoCapaRoleta = Math.min(larguraDaJanela * 0.72, 250);
    const espacoEntreCapas = 20;
    const animacaoTrilho = useRef(new Animated.Value(0)).current;
    const giroAtivo = useRef(false);
    const [musicas, setMusicas] = useState<Musica[]>([]);
    const [musicaSorteada, setMusicaSorteada] = useState<Musica | null>(null);
    const [capasEmGiro, setCapasEmGiro] = useState<Musica[]>([]);
    const [idsSalvos, setIdsSalvos] = useState<Set<number>>(new Set());
    const [carregando, setCarregando] = useState(true);
    const [girando, setGirando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState(false);

    useEffect(() => {
        let ativo = true;
        Promise.allSettled([buscarMusicas(), buscarIdsSalvos()]).then(([resultadoMusicas, resultadoSalvos]) => {
            if (!ativo) return;

            if (resultadoMusicas.status === "fulfilled") {
                setMusicas(resultadoMusicas.value);
            } else {
                console.error("Erro ao carregar o catálogo para a Roleta Musical:", resultadoMusicas.reason);
                setErro(true);
            }

            if (resultadoSalvos.status === "fulfilled") {
                setIdsSalvos(resultadoSalvos.value);
            }

            setCarregando(false);
        });

        return () => { ativo = false; };
    }, []);

    useEffect(() => () => {
        animacaoTrilho.stopAnimation();
        giroAtivo.current = false;
    }, [animacaoTrilho]);

    function sortearMusica() {
        if (musicas.length === 0 || giroAtivo.current) return;

        const opcoes = musicaSorteada && musicas.length > 1
            ? musicas.filter((musica) => musica.id !== musicaSorteada.id)
            : musicas;
        const sorteada = opcoes[Math.floor(Math.random() * opcoes.length)];
        const indiceFinal = 10;
        const capas = Array.from({ length: indiceFinal + 1 }, (_, indice) => (
            indice === indiceFinal
                ? sorteada
                : musicas[Math.floor(Math.random() * musicas.length)]
        ));

        giroAtivo.current = true;
        setGirando(true);
        setCapasEmGiro(capas);
        animacaoTrilho.setValue(0);
        feedbackAcao();

        const passoDoTrilho = tamanhoCapaRoleta + espacoEntreCapas;
        const deslocamentoInicial = Math.max(0, (larguraDaJanela - tamanhoCapaRoleta) / 2);
        const deslocamentoFinal = Math.max(
            0,
            indiceFinal * passoDoTrilho - deslocamentoInicial,
        );
        animacaoTrilho.setValue(deslocamentoInicial);
        Animated.timing(animacaoTrilho, {
            toValue: -deslocamentoFinal,
            duration: 2700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setMusicaSorteada(sorteada);
                setCapasEmGiro([]);
                setGirando(false);
                giroAtivo.current = false;
                feedbackSelecao();
            }
        });
    }

    async function alternarSalva() {
        if (!musicaSorteada || salvando) return;

        const jaSalva = idsSalvos.has(musicaSorteada.id);
        setSalvando(true);
        try {
            await alternarSalvamentoMusica(musicaSorteada.id, jaSalva);
            setIdsSalvos((atuais) => {
                const novos = new Set(atuais);
                if (jaSalva) novos.delete(musicaSorteada.id);
                else novos.add(musicaSorteada.id);
                return novos;
            });
            feedbackSelecao();
            Toast.show({
                type: "success",
                text1: jaSalva ? "Removida das salvas" : "Música salva",
                text2: musicaSorteada.titulo,
            });
        } catch (erroSalvamento) {
            console.error("Erro ao salvar música sorteada:", erroSalvamento);
            Toast.show({ type: "error", text1: "Não foi possível atualizar suas músicas salvas." });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar tipo="voltar" titulo="Roleta musical" subtitulo="Deixe o acaso escolher" />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View className="mb-5 mt-1 flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-[#F5C879]/30 bg-[#F5C879]/10">
                        <DiceFiveIcon size={21} color="#F5C879" weight="fill" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-serif text-2xl text-white">Uma faixa ao acaso</Text>
                        <Text className="mt-1 text-sm text-[#9AA5B5]">Sorteada do catálogo da Maré</Text>
                    </View>
                </View>

                {carregando ? (
                    <View className="h-[390px] items-center justify-center rounded-3xl border border-[#252D3C] bg-[#111420]">
                        <ActivityIndicator color="#F5C879" />
                        <Text className="mt-3 text-sm text-[#9AA5B5]">Carregando músicas...</Text>
                    </View>
                ) : erro ? (
                    <View className="rounded-3xl border border-[#252D3C] bg-[#111420] p-6">
                        <Text className="font-serif text-xl text-white">Não foi possível carregar a roleta</Text>
                        <Text className="mt-2 text-sm leading-5 text-[#9AA5B5]">Confira sua conexão e tente novamente.</Text>
                        <Pressable onPress={() => router.replace("/explorar")} className="mt-5 self-start rounded-full bg-[#1C314B] px-5 py-3">
                            <Text className="text-sm font-semibold text-white">Voltar para Explorar</Text>
                        </Pressable>
                    </View>
                ) : musicas.length === 0 ? (
                    <View className="rounded-3xl border border-[#252D3C] bg-[#111420] p-6">
                        <Text className="font-serif text-xl text-white">Ainda não há músicas no catálogo</Text>
                        <Text className="mt-2 text-sm leading-5 text-[#9AA5B5]">Quando novas músicas chegarem à Maré, você poderá sorteá-las por aqui.</Text>
                    </View>
                ) : (
                    <>
                        {girando ? (
                            <View className="overflow-hidden rounded-3xl border border-[#F5C879]/40 bg-[#111420] px-4 py-7">
                                <View className="mb-4 flex-row items-center justify-center">
                                    <DiceFiveIcon size={17} color="#F5C879" weight="fill" />
                                    <Text className="ml-2 text-xs font-bold tracking-[1.3px] text-[#F5C879]">A SORTE ESTÁ GIRANDO</Text>
                                </View>
                                <View style={{ height: tamanhoCapaRoleta + 12 }} className="justify-center overflow-hidden rounded-2xl">
                                    <Animated.View
                                        style={{ transform: [{ translateX: animacaoTrilho }] }}
                                        className="flex-row items-center"
                                    >
                                        {capasEmGiro.map((musica, indice) => (
                                            <View
                                                key={`${musica.id}-${indice}`}
                                                style={{
                                                    width: tamanhoCapaRoleta,
                                                    height: tamanhoCapaRoleta,
                                                    marginRight: espacoEntreCapas,
                                                }}
                                                className="overflow-hidden rounded-3xl border border-white/10"
                                            >
                                                <ImageBackground
                                                    source={musica.capa ? { uri: musica.capa } : capaPadrao}
                                                    resizeMode="cover"
                                                    style={{ width: "100%", height: "100%" }}
                                                >
                                                    <LinearGradient
                                                        pointerEvents="none"
                                                        colors={["rgba(5,7,12,0.34)", "rgba(5,7,12,0.48)", "rgba(5,7,12,0.66)"]}
                                                        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
                                                    />
                                                </ImageBackground>
                                            </View>
                                        ))}
                                    </Animated.View>
                                    <View
                                        pointerEvents="none"
                                        className="absolute top-1.5 rounded-3xl border-2 border-[#F5C879]"
                                        style={{
                                            left: (larguraDaJanela - tamanhoCapaRoleta) / 2,
                                            width: tamanhoCapaRoleta,
                                            height: tamanhoCapaRoleta,
                                            shadowColor: "#F5C879",
                                            shadowOpacity: 0.45,
                                            shadowRadius: 12,
                                            elevation: 6,
                                        }}
                                    />
                                </View>
                                <Text className="mt-4 text-center text-sm text-[#D0D8E4]">Passando pelas músicas do catálogo...</Text>
                            </View>
                        ) : musicaSorteada ? (
                            <View className="overflow-hidden rounded-3xl border border-[#F5C879]/45 bg-[#111420]">
                                <ImageBackground
                                    source={musicaSorteada.capa ? { uri: musicaSorteada.capa } : capaPadrao}
                                    resizeMode="cover"
                                    className="h-[330px] justify-between"
                                >
                                    <LinearGradient
                                        pointerEvents="none"
                                        colors={["rgba(5,7,12,0.12)", "rgba(5,7,12,0.28)", "rgba(5,7,12,0.96)"]}
                                        locations={[0, 0.42, 1]}
                                        style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }}
                                    />
                                    <View className="flex-row items-center justify-between p-4">
                                        <View className="flex-row items-center rounded-full border border-[#F5C879]/40 bg-black/55 px-3 py-2">
                                            <DiceFiveIcon size={15} color="#F5C879" weight="fill" />
                                            <Text className="ml-2 text-[10px] font-bold tracking-[1.1px] text-[#F5C879]">
                                                {girando ? "A SORTE ESTÁ GIRANDO" : "SORTEADA PARA VOCÊ"}
                                            </Text>
                                        </View>
                                        {musicaSorteada.genero ? (
                                            <View className="max-w-[45%] rounded-full bg-black/50 px-3 py-2">
                                                <Text className="text-xs text-white" numberOfLines={1}>{musicaSorteada.genero}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    <View className="p-5">
                                        <Text className="font-serif text-[28px] leading-9 text-white" numberOfLines={2}>{musicaSorteada.titulo}</Text>
                                        <Pressable
                                            onPress={() => musicaSorteada.artista?.id && router.push(`/artista/${musicaSorteada.artista.id}` as never)}
                                            disabled={!musicaSorteada.artista?.id}
                                            className="mt-3 flex-row items-center self-start"
                                        >
                                            <FotoArtista
                                                url={musicaSorteada.artista?.fotoURL}
                                                style={{ width: 27, height: 27, borderRadius: 14, marginRight: 9 }}
                                            />
                                            <Text className="text-sm text-[#E2E6EC]" numberOfLines={1}>
                                                {musicaSorteada.artista?.nome ?? "Artista desconhecido"}
                                            </Text>
                                            {musicaSorteada.artista?.id ? <ArrowRightIcon size={14} color="#D0D8E4" style={{ marginLeft: 4 }} /> : null}
                                        </Pressable>
                                    </View>
                                </ImageBackground>

                                <View className="flex-row gap-3 p-4">
                                    <Pressable
                                        onPress={() => void alternarSalva()}
                                        disabled={salvando || girando}
                                        accessibilityRole="button"
                                        accessibilityLabel={idsSalvos.has(musicaSorteada.id) ? "Remover música das salvas" : "Salvar música"}
                                        className="h-12 w-12 items-center justify-center rounded-full border border-[#31394A] bg-[#171E2B]"
                                    >
                                        {salvando
                                            ? <ActivityIndicator size="small" color="#F5C879" />
                                            : <BookmarkSimpleIcon size={21} color={idsSalvos.has(musicaSorteada.id) ? "#F5C879" : "#E5E7EB"} weight={idsSalvos.has(musicaSorteada.id) ? "fill" : "regular"} />}
                                    </Pressable>
                                    <Pressable
                                        onPress={() => router.push({ pathname: "/criar", params: { musica: String(musicaSorteada.id) } } as never)}
                                        disabled={girando}
                                        className="h-12 flex-1 flex-row items-center justify-center rounded-full bg-[#F5C879]"
                                    >
                                        <StarIcon size={18} color="#17130B" weight="fill" />
                                        <Text className="ml-2 text-sm font-bold text-[#17130B]">Avaliar</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => router.push(`/musica/${musicaSorteada.id}` as never)}
                                        disabled={girando}
                                        className="h-12 flex-1 flex-row items-center justify-center rounded-full border border-[#31394A] bg-[#171E2B]"
                                    >
                                        <Text className="mr-1 text-sm font-semibold text-white">Conhecer</Text>
                                        <ArrowRightIcon size={16} color="#FFFFFF" />
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <View className="h-[390px] items-center justify-center overflow-hidden rounded-3xl border border-[#F5C879]/35 bg-[#111420] px-8">
                                <View className="mb-5 h-20 w-20 items-center justify-center rounded-full border border-[#F5C879]/35 bg-[#F5C879]/10">
                                    <DiceFiveIcon size={39} color="#F5C879" weight="duotone" />
                                </View>
                                <Text className="text-center font-serif text-2xl text-white">Descubra sua próxima música</Text>
                                <Text className="mt-2 max-w-[280px] text-center text-sm leading-5 text-[#9AA5B5]">A roleta escolhe uma faixa do catálogo. Se quiser outra, é só girar de novo.</Text>
                            </View>
                        )}

                        <Pressable
                            onPress={sortearMusica}
                            disabled={girando}
                            accessibilityRole="button"
                            className="mt-5 h-14 flex-row items-center justify-center rounded-full border border-[#F5C879]/55 bg-[#F5C879]/10"
                            style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
                        >
                            {girando
                                ? <ActivityIndicator color="#F5C879" />
                                : <DiceFiveIcon size={20} color="#F5C879" weight="fill" />}
                            <Text className="ml-2 text-base font-semibold text-[#F5C879]">
                                {girando ? "Girando..." : musicaSorteada ? "Sortear outra música" : "Sortear música"}
                            </Text>
                        </Pressable>
                    </>
                )}
            </ScrollView>
            <Navbar />
        </SafeAreaView>
    );
}

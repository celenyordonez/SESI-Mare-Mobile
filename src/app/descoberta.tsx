import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Image,
    Modal,
    PanResponder,
    Pressable,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
    ArrowRightIcon,
    BookmarkSimpleIcon,
    CheckIcon,
    MusicNotesIcon,
    XIcon,
} from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Topbar from "../components/topbar";
import { usePaletaCapa } from "../hooks/usePaletaCapa";
import type { Musica } from "../services/musicaService";
import { buscarMusicasParaDescoberta } from "../services/recomendacaoService";
import { salvarArtistasFavoritos, salvarGenerosFavoritos } from "../services/preferenciaService";
import { alternarSalvamentoMusica, buscarIdsSalvos } from "../services/salvamentoService";
import { feedbackAcao, feedbackSelecao } from "../services/feedbackTatil";
import { corComOpacidade } from "../services/paletaCapaService";

const capaPadrao = require("../../assets/images/logo.png");
const CHAVE_TUTORIAL_DESCOBERTA = "mare:descoberta:tutorial-v1";
const CHAVE_TUTORIAL_PERSONALIZACAO = "mare:descoberta:personalizacao-tutorial-v1";
type MusicaDescoberta = Musica & { _count?: { posts?: number } };

export default function Descoberta() {
    const router = useRouter();
    const parametros = useLocalSearchParams<{ onboarding?: string }>();
    const emOnboarding = parametros.onboarding === "sim";
    const { width, height } = useWindowDimensions();
    const posicao = useRef(new Animated.ValueXY()).current;
    const progressoGesto = useRef(new Animated.Value(0)).current;
    const [musicas, setMusicas] = useState<MusicaDescoberta[]>([]);
    const [indice, setIndice] = useState(0);
    const [salvas, setSalvas] = useState<Set<number>>(new Set());
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [revisaoLista, setRevisaoLista] = useState(0);
    const [tutorialAberto, setTutorialAberto] = useState(false);
    const [generosEscolhidos, setGenerosEscolhidos] = useState<Set<string>>(new Set());
    const [artistasEscolhidos, setArtistasEscolhidos] = useState<Set<number>>(new Set());
    const [salvandoPreferencias, setSalvandoPreferencias] = useState(false);
    const [erroPreferencias, setErroPreferencias] = useState("");
    const musicaAtual = musicas[indice] ?? null;
    const paleta = usePaletaCapa(musicaAtual?.capa);
    const corDinamica = paleta?.dominante ?? "#58AAF0";
    const alturaCapa = Math.min(width - 40, Math.max(160, height * 0.32));

    useEffect(() => {
        let ativo = true;
        const chaveTutorial = emOnboarding ? CHAVE_TUTORIAL_PERSONALIZACAO : CHAVE_TUTORIAL_DESCOBERTA;

        AsyncStorage.getItem(chaveTutorial)
            .then((visto) => {
                if (ativo && visto !== "sim") setTutorialAberto(true);
            })
            .catch(() => {
                if (ativo) setTutorialAberto(true);
            });

        return () => { ativo = false; };
    }, [emOnboarding]);

    async function fecharTutorial() {
        setTutorialAberto(false);
        try {
            await AsyncStorage.setItem(emOnboarding ? CHAVE_TUTORIAL_PERSONALIZACAO : CHAVE_TUTORIAL_DESCOBERTA, "sim");
        } catch (erroTutorial) {
            console.warn("Não foi possível salvar que o tutorial foi visto.", erroTutorial);
        }
    }

    const irParaProxima = useCallback(() => {
        Animated.parallel([
            Animated.timing(posicao, {
                toValue: { x: -width - 80, y: 0 },
                duration: 240,
                useNativeDriver: true,
            }),
            Animated.timing(progressoGesto, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) return;
            posicao.setValue({ x: 0, y: 0 });
            setIndice((atual) => atual + 1);
        });
    }, [posicao, progressoGesto, width]);

    const avaliarMusica = useCallback(() => {
        if (!musicaAtual) return;
        feedbackAcao();
        Animated.parallel([
            Animated.timing(posicao, {
                toValue: { x: width + 80, y: 0 },
                duration: 240,
                useNativeDriver: true,
            }),
            Animated.timing(progressoGesto, {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
            }),
        ]).start(({ finished }) => {
            if (!finished) return;
            const id = musicaAtual.id;
            if (emOnboarding) {
                if (musicaAtual.genero?.trim()) {
                    setGenerosEscolhidos((atuais) => new Set(atuais).add(musicaAtual.genero!.trim()));
                }
                if (musicaAtual.artista?.id) {
                    setArtistasEscolhidos((atuais) => new Set(atuais).add(musicaAtual.artista!.id));
                }
                setErroPreferencias("");
                posicao.setValue({ x: 0, y: 0 });
                setIndice((atual) => atual + 1);
                return;
            }
            posicao.setValue({ x: 0, y: 0 });
            setIndice((atual) => atual + 1);
            router.push({ pathname: "/criar", params: { musica: String(id) } } as never);
        });
    }, [emOnboarding, musicaAtual, posicao, progressoGesto, router, width]);

    const comandos = useRef({ pular: irParaProxima, avaliar: avaliarMusica });
    comandos.current = { pular: irParaProxima, avaliar: avaliarMusica };

    const gesto = useMemo(
        () =>
            PanResponder.create({
                onMoveShouldSetPanResponder: (_event, movimento) => {
                    const gestoHorizontal = Math.abs(movimento.dx) > 8 && Math.abs(movimento.dx) > Math.abs(movimento.dy);
                    return gestoHorizontal;
                },
                onMoveShouldSetPanResponderCapture: (_event, movimento) =>
                    Math.abs(movimento.dx) > 8 && Math.abs(movimento.dx) > Math.abs(movimento.dy),
                onPanResponderTerminationRequest: () => false,
                onPanResponderMove: (_event, movimento) => {
                    posicao.setValue({ x: movimento.dx, y: movimento.dy * 0.12 });
                    progressoGesto.setValue(Math.max(-1, Math.min(1, movimento.dx / (width * 0.65))));
                },
                onPanResponderRelease: (_event, movimento) => {
                    if (movimento.dx > 105) {
                        comandos.current.avaliar();
                    } else if (movimento.dx < -105) {
                        feedbackSelecao();
                        comandos.current.pular();
                    } else {
                        Animated.parallel([
                            Animated.spring(posicao, {
                                toValue: { x: 0, y: 0 },
                                useNativeDriver: true,
                                friction: 7,
                            }),
                            Animated.spring(progressoGesto, {
                                toValue: 0,
                                useNativeDriver: true,
                                friction: 8,
                            }),
                        ]).start();
                    }
                },
            }),
        [posicao, progressoGesto, width],
    );

    useEffect(() => {
        let ativo = true;

        async function carregar() {
            setCarregando(true);
            setErro("");
            try {
                const [lista, idsSalvos] = await Promise.all([
                    buscarMusicasParaDescoberta(),
                    buscarIdsSalvos().catch(() => new Set<number>()),
                ]);
                if (!ativo) return;
                setMusicas(lista);
                setSalvas(idsSalvos);
                setIndice(0);
            } catch (erroBusca) {
                if (!ativo) return;
                setErro(erroBusca instanceof Error ? erroBusca.message : "Tente novamente em instantes.");
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregar();
        return () => {
            ativo = false;
        };
    }, [revisaoLista]);

    async function alternarSalva() {
        if (!musicaAtual || salvando) return;
        const jaSalva = salvas.has(musicaAtual.id);
        setSalvando(true);
        feedbackAcao();
        try {
            await alternarSalvamentoMusica(musicaAtual.id, jaSalva);
            setSalvas((atuais) => {
                const novaLista = new Set(atuais);
                if (jaSalva) novaLista.delete(musicaAtual.id);
                else novaLista.add(musicaAtual.id);
                return novaLista;
            });
        } catch (erroSalvamento) {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar as músicas salvas.",
                text2: erroSalvamento instanceof Error ? erroSalvamento.message : undefined,
            });
        } finally {
            setSalvando(false);
        }
    }

    async function concluirPersonalizacao() {
        if (salvandoPreferencias) return;
        if (generosEscolhidos.size === 0 || artistasEscolhidos.size === 0) {
            setErroPreferencias("Marque gostei em pelo menos uma música para personalizar suas recomendações.");
            return;
        }

        setSalvandoPreferencias(true);
        setErroPreferencias("");
        try {
            await salvarArtistasFavoritos([...artistasEscolhidos]);
            await salvarGenerosFavoritos([...generosEscolhidos]);
            feedbackAcao();
            router.replace("/home");
        } catch (erro) {
            setErroPreferencias(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível salvar suas preferências. Tente novamente.",
            );
        } finally {
            setSalvandoPreferencias(false);
        }
    }

    const rotacao = posicao.x.interpolate({
        inputRange: [-width, 0, width],
        outputRange: ["-9deg", "0deg", "9deg"],
    });
    const opacidadeSim = progressoGesto.interpolate({
        inputRange: [0, 0.08, 0.35, 1],
        outputRange: [0, 0.12, 0.58, 0.94],
        extrapolate: "clamp",
    });
    const opacidadeNao = progressoGesto.interpolate({
        inputRange: [-1, -0.35, -0.08, 0],
        outputRange: [0.94, 0.58, 0.12, 0],
        extrapolate: "clamp",
    });

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo={emOnboarding ? "simples" : "voltar"} />
            <View className="px-5 pb-3">
                <Text className="text-[#142338] dark:text-white text-2xl font-serif">
                    {emOnboarding ? "Vamos personalizar sua Maré" : "Descoberta"}
                </Text>
                <Text className="mt-1 text-sm text-[#52677F] dark:text-[#8793A7]">
                    {emOnboarding
                        ? "Direita para gostei, esquerda para pular. Vamos usar suas escolhas nas recomendações."
                        : "Arraste para escolher o próximo som."}
                </Text>
            </View>

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#58AAF0" size="large" />
                    <Text className="mt-3 text-sm text-[#52677F] dark:text-[#718096]">Buscando recomendações...</Text>
                </View>
            ) : erro ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-center text-sm text-red-400">{erro}</Text>
                    <Pressable onPress={() => setRevisaoLista((valor) => valor + 1)} className="mt-5 rounded-xl bg-[#58AAF0] px-5 py-3">
                        <Text className="text-sm font-semibold text-[#07111E]">Tentar novamente</Text>
                    </Pressable>
                    <Pressable onPress={() => router.replace("/explorar")} className="mt-2 rounded-xl bg-[#1C314B] px-5 py-3">
                        <Text className="text-sm text-[#142338] dark:text-white">Voltar para Explorar</Text>
                    </Pressable>
                </View>
            ) : musicaAtual ? (
                <View className="flex-1 px-5 pb-4">
                    <Text className="mb-3 text-center text-xs text-[#52677F] dark:text-[#718096]">
                        {indice + 1} de {musicas.length}
                        {emOnboarding ? ` · ${artistasEscolhidos.size} artistas escolhidos` : ""}
                    </Text>
                    <View className="flex-1">
                        {musicas[indice + 2] && (
                            <View
                                pointerEvents="none"
                                className="absolute left-3 right-3 top-4 overflow-hidden rounded-3xl border border-[#C5D3E1] dark:border-[#354052] bg-[#151A26]"
                                style={{ bottom: -12, transform: [{ rotate: "3deg" }] }}
                            >
                                <Image
                                    source={musicas[indice + 2].capa ? { uri: musicas[indice + 2].capa! } : capaPadrao}
                                    className="h-full w-full"
                                    style={{ opacity: 0.35 }}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                        {musicas[indice + 1] && (
                            <View
                                pointerEvents="none"
                                className="absolute left-1.5 right-1.5 top-2 overflow-hidden rounded-3xl border border-[#3A465A] bg-[#131824]"
                                style={{ bottom: -6, transform: [{ rotate: "1.5deg" }] }}
                            >
                                <Image
                                    source={musicas[indice + 1].capa ? { uri: musicas[indice + 1].capa! } : capaPadrao}
                                    className="h-full w-full"
                                    style={{ opacity: 0.45 }}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={["rgba(8,10,16,0.35)", "rgba(8,10,16,0.75)"]}
                                    className="absolute bottom-0 left-0 right-0 top-0"
                                />
                            </View>
                        )}
                        <Animated.View
                            pointerEvents="none"
                            style={{
                                position: "absolute",
                                left: -3,
                                right: -3,
                                top: -3,
                                bottom: -3,
                                transform: [
                                    { translateX: posicao.x },
                                    { translateY: posicao.y },
                                    { rotate: rotacao },
                                ],
                                borderWidth: 2,
                                borderRadius: 26,
                                borderColor: corComOpacidade(paleta?.acento ?? "#A9C8E8", 0.54),
                                shadowColor: corDinamica,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 0.6,
                                shadowRadius: 20,
                                elevation: 7,
                            }}
                        />
                        <Animated.View
                            {...gesto.panHandlers}
                            style={{
                                transform: [
                                    { translateX: posicao.x },
                                    { translateY: posicao.y },
                                    { rotate: rotacao },
                                ],
                                backgroundColor: "rgba(17,20,32,0.94)",
                                borderColor: corComOpacidade(paleta?.acento ?? "#A9C8E8", 0.72),
                                shadowColor: corDinamica,
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.28,
                                shadowRadius: 22,
                                elevation: 6,
                            }}
                            className="flex-1 overflow-hidden rounded-3xl border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420]"
                        >
                        <View style={{ height: alturaCapa }} className="relative w-full bg-[#F4F7FA] dark:bg-[#171E2B]">
                            <Image
                                source={musicaAtual.capa ? { uri: musicaAtual.capa } : capaPadrao}
                                className="h-full w-full"
                                resizeMode="cover"
                            />
                            <Pressable
                                onPress={() => void alternarSalva()}
                                disabled={salvando}
                                accessibilityLabel={salvas.has(musicaAtual.id) ? "Remover música dos salvos" : "Salvar música"}
                                className="absolute right-4 top-4 h-11 w-11 items-center justify-center rounded-full border"
                                style={{
                                    borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.45),
                                    backgroundColor: corComOpacidade(paleta?.dominante ?? "#080A10", 0.48),
                                }}
                            >
                                <BookmarkSimpleIcon
                                    size={21}
                                    color={salvas.has(musicaAtual.id) ? corDinamica : "#FFFFFF"}
                                    weight={salvas.has(musicaAtual.id) ? "fill" : "regular"}
                                />
                            </Pressable>
                        </View>
                        <View className="flex-1 justify-center px-5 pb-4 pt-4">
                            <View className="flex-row items-center">
                                <View className="flex-1">
                                    <Text className="text-[#142338] dark:text-white text-2xl font-serif" numberOfLines={2}>
                                        {musicaAtual.titulo}
                                    </Text>
                                    <Text className="mt-2 text-base text-[#B5C0D1]" numberOfLines={1}>
                                        {musicaAtual.artista?.nome ?? "Artista desconhecido"}
                                    </Text>
                                </View>
                                <MusicNotesIcon size={23} color={corDinamica} />
                            </View>
                            <View className="mt-4 flex-row flex-wrap items-center">
                                {!!musicaAtual.genero && (
                                    <View
                                        className="mr-2 rounded-full border px-3 py-2"
                                        style={{
                                            borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.48),
                                            backgroundColor: corComOpacidade(paleta?.dominante ?? "#58AAF0", 0.22),
                                        }}
                                    >
                                        <Text className="text-xs text-[#E5EAF2]">{musicaAtual.genero}</Text>
                                    </View>
                                )}
                                {(musicaAtual._count?.posts ?? musicaAtual.avaliacoes ?? 0) > 0 && (
                                    <Text className="text-xs text-[#52677F] dark:text-[#718096]">
                                        {musicaAtual._count?.posts ?? musicaAtual.avaliacoes} avaliações na Maré
                                    </Text>
                                )}
                            </View>
                            <Pressable
                                onPress={() => router.push(`/musica/${musicaAtual.id}` as never)}
                                className="mt-3 flex-row items-center self-start py-2"
                            >
                                <Text style={{ color: paleta?.acento ?? "#58AAF0" }} className="text-sm font-medium">Ver detalhes da música</Text>
                                <ArrowRightIcon size={16} color={paleta?.acento ?? "#58AAF0"} style={{ marginLeft: 4 }} />
                            </Pressable>
                        </View>
                        </Animated.View>
                    </View>

                    <View className="mt-5 flex-row items-center justify-center">
                        <Pressable
                            onPress={() => {
                                feedbackSelecao();
                                irParaProxima();
                            }}
                            className="mr-4 h-14 w-14 items-center justify-center rounded-full border"
                            style={{
                                borderColor: corComOpacidade(paleta?.acento ?? "#A9C8E8", 0.4),
                                backgroundColor: corComOpacidade(paleta?.dominante ?? "#58AAF0", 0.16),
                            }}
                            accessibilityLabel="Pular música"
                        >
                            <XIcon size={25} color={paleta?.acento ?? "#B5C0D1"} weight="bold" />
                        </Pressable>
                        <Pressable
                            onPress={avaliarMusica}
                            className="h-14 flex-1 flex-row items-center justify-center rounded-full bg-[#58AAF0]"
                        >
                            <Text className="text-base font-semibold text-[#07111E]">
                                {emOnboarding ? "Gosto" : "Quero avaliar"}
                            </Text>
                            {emOnboarding ? (
                                <CheckIcon size={19} color="#07111E" style={{ marginLeft: 8 }} weight="bold" />
                            ) : (
                                <ArrowRightIcon size={19} color="#07111E" style={{ marginLeft: 8 }} />
                            )}
                        </Pressable>
                    </View>
                    {emOnboarding && generosEscolhidos.size > 0 && artistasEscolhidos.size > 0 ? (
                        <Pressable
                            onPress={() => void concluirPersonalizacao()}
                            disabled={salvandoPreferencias}
                            className="mt-3 items-center py-2"
                        >
                            <Text className="text-sm font-medium text-[#A9C8E8]">
                                {salvandoPreferencias ? "Salvando preferências..." : "Concluir personalização"}
                            </Text>
                        </Pressable>
                    ) : null}
                    {emOnboarding ? (
                        <>
                            {erroPreferencias ? (
                                <Text className="mt-2 text-center text-xs text-red-400">{erroPreferencias}</Text>
                            ) : null}
                            <Pressable onPress={() => router.replace("/filtrar")} className="mt-1 items-center py-2">
                                <Text className="text-xs text-[#52677F] dark:text-[#8793A7]">Prefiro escolher gêneros e artistas</Text>
                            </Pressable>
                        </>
                    ) : null}
                </View>
            ) : musicas.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-[#1C314B]">
                        <MusicNotesIcon size={27} color="#58AAF0" />
                    </View>
                    <Text className="mt-4 text-center text-lg font-serif text-[#142338] dark:text-white">
                        {emOnboarding ? "Ainda não há músicas para personalizar seu perfil" : "Não encontramos músicas novas para sugerir"}
                    </Text>
                    <Text className="mt-2 text-center text-sm leading-5 text-[#52677F] dark:text-[#8793A7]">
                        {emOnboarding
                            ? "Você pode escolher gêneros e artistas manualmente para continuar."
                            : "Atualize as recomendações ou explore o catálogo para encontrar outra música."}
                    </Text>
                    <Pressable
                        onPress={() => setRevisaoLista((valor) => valor + 1)}
                        className="mt-5 rounded-xl bg-[#58AAF0] px-5 py-3"
                    >
                        <Text className="text-sm font-semibold text-[#07111E]">Tentar novamente</Text>
                    </Pressable>
                    <Pressable onPress={() => router.replace(emOnboarding ? "/filtrar" : "/explorar")} className="mt-2 rounded-xl bg-[#1C314B] px-5 py-3">
                        <Text className="text-sm text-[#142338] dark:text-white">{emOnboarding ? "Escolher manualmente" : "Voltar para Explorar"}</Text>
                    </Pressable>
                </View>
            ) : (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-[#1C314B]">
                        <MusicNotesIcon size={27} color="#58AAF0" />
                    </View>
                    <Text className="mt-4 text-center text-lg font-serif text-[#142338] dark:text-white">
                        {emOnboarding
                            ? artistasEscolhidos.size > 0 && generosEscolhidos.size > 0
                                ? "Seu gosto musical já tem um começo"
                                : "Vamos completar suas preferências"
                            : "Você chegou ao fim das recomendações"}
                    </Text>
                    <Text className="mt-2 text-center text-sm leading-5 text-[#52677F] dark:text-[#8793A7]">
                        {emOnboarding
                            ? artistasEscolhidos.size > 0 && generosEscolhidos.size > 0
                                ? `${artistasEscolhidos.size} artistas e ${generosEscolhidos.size} gêneros selecionados.`
                                : "Marque gostei em uma música com artista e gênero para receber recomendações personalizadas."
                            : "Você já passou por todas as músicas disponíveis nesta lista."}
                    </Text>
                    {emOnboarding ? (
                        <>
                            {erroPreferencias ? (
                                <Text className="mt-4 text-center text-sm text-red-400">{erroPreferencias}</Text>
                            ) : null}
                            {artistasEscolhidos.size > 0 && generosEscolhidos.size > 0 ? (
                                <Pressable
                                    onPress={() => void concluirPersonalizacao()}
                                    disabled={salvandoPreferencias}
                                    className="mt-5 rounded-xl bg-[#58AAF0] px-5 py-3"
                                >
                                    <Text className="text-sm font-semibold text-[#07111E]">
                                        {salvandoPreferencias ? "Salvando..." : "Concluir e ir para a Home"}
                                    </Text>
                                </Pressable>
                            ) : null}
                            <Pressable onPress={() => router.replace("/filtrar")} className="mt-2 rounded-xl bg-[#1C314B] px-5 py-3">
                                <Text className="text-sm text-[#142338] dark:text-white">Escolher manualmente</Text>
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <Pressable
                                onPress={() => {
                                    posicao.setValue({ x: 0, y: 0 });
                                    setIndice(0);
                                }}
                                className="mt-5 rounded-xl bg-[#58AAF0] px-5 py-3"
                            >
                                <Text className="text-sm font-semibold text-[#07111E]">Recomeçar a lista</Text>
                            </Pressable>
                            <Pressable onPress={() => router.replace("/explorar")} className="mt-2 rounded-xl bg-[#1C314B] px-5 py-3">
                                <Text className="text-sm text-[#142338] dark:text-white">Voltar para Explorar</Text>
                            </Pressable>
                        </>
                    )}
                </View>
            )}

            {/* O brilho de direção atravessa a tela inteira enquanto o cartão é arrastado. */}
            <Animated.View
                pointerEvents="none"
                style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: opacidadeSim, zIndex: 90, elevation: 90 }}
            >
                <LinearGradient
                    colors={["rgba(16, 185, 129, 0.50)", "rgba(16, 185, 129, 0.24)", "rgba(16, 185, 129, 0.04)"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={{ flex: 1 }}
                />
                <Animated.View
                    className="absolute left-6 h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-200 bg-[#073B32]/90"
                    style={{
                        top: "48%",
                        transform: [{ scale: opacidadeSim.interpolate({ inputRange: [0, 0.68], outputRange: [0.82, 1.08] }) }],
                    }}
                >
                    <CheckIcon size={34} color="#D1FAE5" weight="bold" />
                </Animated.View>
            </Animated.View>
            <Animated.View
                pointerEvents="none"
                style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, opacity: opacidadeNao, zIndex: 90, elevation: 90 }}
            >
                <LinearGradient
                    colors={["rgba(244, 63, 94, 0.48)", "rgba(244, 63, 94, 0.22)", "rgba(244, 63, 94, 0.04)"]}
                    start={{ x: 1, y: 0.5 }}
                    end={{ x: 0, y: 0.5 }}
                    style={{ flex: 1 }}
                />
                <Animated.View
                    className="absolute right-6 h-16 w-16 items-center justify-center rounded-full border-2 border-rose-200 bg-[#481B29]/90"
                    style={{
                        top: "48%",
                        transform: [{ scale: opacidadeNao.interpolate({ inputRange: [0, 0.68], outputRange: [0.82, 1.08] }) }],
                    }}
                >
                    <XIcon size={34} color="#FFE4E6" weight="bold" />
                </Animated.View>
            </Animated.View>

            <Modal
                visible={tutorialAberto}
                transparent
                animationType="fade"
                onRequestClose={() => void fecharTutorial()}
            >
                <View className="flex-1 justify-center bg-black/75 px-6">
                    <View className="rounded-3xl border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] p-6">
                        <Text className="font-serif text-2xl text-[#142338] dark:text-white">Como funciona</Text>
                        <Text className="mt-3 text-sm leading-6 text-[#B5C0D1]">
                            Descubra músicas uma por vez e escolha o que fazer com cada cartão.
                        </Text>
                        <View className="mt-5 rounded-2xl border border-[#263447] bg-[#F4F7FA] dark:bg-[#0B1019] p-4">
                            <View className="flex-row items-center">
                                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15">
                                    <CheckIcon size={18} color="#34D399" weight="bold" />
                                </View>
                                <Text className="text-sm font-semibold text-emerald-400">Arraste para a direita</Text>
                            </View>
                            <View className="mt-3 flex-row items-center">
                                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-rose-500/15">
                                    <XIcon size={18} color="#FB7185" weight="bold" />
                                </View>
                                <Text className="text-sm font-semibold text-rose-400">Arraste para a esquerda</Text>
                            </View>
                            <Text className="mt-3 text-sm leading-5 text-[#52677F] dark:text-[#8793A7]">
                                {emOnboarding
                                    ? "O ✓ à direita guarda o gênero e o artista nas suas preferências. O × à esquerda pula a faixa. Você também pode usar os botões abaixo do cartão."
                                    : "O ✓ à direita abre a criação de uma avaliação. O × à esquerda pula a faixa. Você também pode usar os botões abaixo do cartão."}
                            </Text>
                        </View>
                        <Pressable
                            onPress={() => void fecharTutorial()}
                            className="mt-6 h-12 items-center justify-center rounded-xl bg-[#58AAF0]"
                        >
                            <Text className="text-sm font-semibold text-[#07111E]">Entendi</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

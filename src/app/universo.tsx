import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    type ScrollViewInstance,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import type { ComponentRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ChartBarIcon,
    MusicNotesIcon,
    ShareNetworkIcon,
    StarIcon,
} from "phosphor-react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import { usePaletaCapa } from "../hooks/usePaletaCapa";
import { buscarEstatisticasUniverso, type EstatisticasUniverso } from "../services/universoService";
import { buscarMusicasSalvas } from "../services/usuarioService";
import type { Musica } from "../services/musicaService";
import { corComOpacidade } from "../services/paletaCapaService";

const imagemPadrao = require("../../assets/images/logo.png");
type MusicaSalva = { musica: Musica };
type TelaRetrospectiva = "abertura" | "resumo" | "generos" | "artistas" | "trajetoria" | "colecao";

function formatarNota(nota: number) {
    return nota.toFixed(1).replace(".", ",");
}

function formatarQuantidade(valor: number, singular: string, plural: string) {
    return `${valor} ${valor === 1 ? singular : plural}`;
}

export default function Universo() {
    const router = useRouter();
    const { width: larguraTela, height: alturaTela } = useWindowDimensions();
    const carrosselRef = useRef<ScrollViewInstance | null>(null);
    const cartaoCompartilhamentoRef = useRef<ComponentRef<typeof View>>(null);
    const animacaoConteudo = useRef(new Animated.Value(1)).current;
    const [indiceAtivo, setIndiceAtivo] = useState(0);
    const [dados, setDados] = useState<EstatisticasUniverso | null>(null);
    const [musicasSalvas, setMusicasSalvas] = useState<MusicaSalva[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState("");
    const [erroColecao, setErroColecao] = useState("");
    const [compartilhamentoAberto, setCompartilhamentoAberto] = useState(false);
    const [compartilhando, setCompartilhando] = useState(false);
    const capaParaPaleta = dados?.artistas[0]?.fotoURL ?? musicasSalvas[0]?.musica.capa;
    const paleta = usePaletaCapa(capaParaPaleta);
    const corAcento = paleta?.acento ?? "#83C6FF";
    const corDominante = paleta?.dominante ?? "#58AAF0";

    const carregar = useCallback(async (atualizacaoManual = false) => {
        setErro("");
        if (atualizacaoManual) setAtualizando(true);
        else setCarregando(true);

        try {
            const [resultadoEstatisticas, resultadoSalvas] = await Promise.allSettled([
                buscarEstatisticasUniverso(),
                buscarMusicasSalvas(),
            ]);
            if (resultadoEstatisticas.status === "rejected") throw resultadoEstatisticas.reason;
            setDados(resultadoEstatisticas.value);

            if (resultadoSalvas.status === "fulfilled") {
                setMusicasSalvas(resultadoSalvas.value);
                setErroColecao("");
            } else {
                console.error("Erro ao buscar músicas salvas para o Universo:", resultadoSalvas.reason);
                setMusicasSalvas([]);
                setErroColecao("Não foi possível carregar suas músicas salvas.");
            }
        } catch (erroBusca) {
            setErro(erroBusca instanceof Error ? erroBusca.message : "Não foi possível carregar Minha Maré.");
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }, []);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    const mesesTrajetoria = useMemo(() => Array.from({ length: 6 }, (_, indice) => {
        const data = new Date();
        data.setDate(1);
        data.setMonth(data.getMonth() - (5 - indice));
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
        const mesAtual = dados?.trajetoria?.find((item) => item.mes.slice(0, 7) === chave);
        return {
            chave,
            nome: data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
            quantidade: mesAtual?.quantidade ?? 0,
        };
    }), [dados?.trajetoria]);
    const mesesComAvaliacoes = mesesTrajetoria.filter((item) => item.quantidade > 0).length;
    const maiorMes = Math.max(1, ...mesesTrajetoria.map((item) => item.quantidade));
    const generosEmDestaque = useMemo(
        () => [...(dados?.generos ?? [])].sort((a, b) => b.quantidade - a.quantidade).slice(0, 5),
        [dados?.generos],
    );
    const artistasEmDestaque = dados?.artistas.slice(0, 8) ?? [];
    const slides = useMemo<TelaRetrospectiva[]>(() => {
        const lista: TelaRetrospectiva[] = ["abertura", "resumo"];
        if (generosEmDestaque.length > 0) lista.push("generos");
        if (artistasEmDestaque.length > 0) lista.push("artistas");
        if (mesesComAvaliacoes >= 2) lista.push("trajetoria");
        if (musicasSalvas.length > 0 || erroColecao) lista.push("colecao");
        return lista;
    }, [generosEmDestaque.length, artistasEmDestaque.length, mesesComAvaliacoes, musicasSalvas.length, erroColecao]);
    const assinaturaSlides = slides.join("|");
    const indiceSeguro = Math.min(indiceAtivo, Math.max(0, slides.length - 1));
    const alturaCartao = Math.min(540, Math.max(400, alturaTela * 0.61));
    // A coleção precisa de uma área vertical maior para mostrar capa, título e artista.
    const alturaCartaoColecao = Math.min(640, Math.max(560, alturaTela * 0.76));
    const larguraCartaoCompartilhamento = Math.min(larguraTela - 56, 360);
    const alturaCartaoCompartilhamento = Math.min(520, Math.max(420, alturaTela * 0.62));

    useEffect(() => {
        setIndiceAtivo(0);
        carrosselRef.current?.scrollTo({ x: 0, animated: false });
    }, [assinaturaSlides]);

    useEffect(() => {
        animacaoConteudo.setValue(0);
        Animated.parallel([
            Animated.timing(animacaoConteudo, {
                toValue: 1,
                duration: 320,
                useNativeDriver: true,
            }),
        ]).start();
    }, [indiceSeguro, animacaoConteudo]);

    function irParaSlide(indice: number) {
        const proximo = Math.max(0, Math.min(indice, slides.length - 1));
        carrosselRef.current?.scrollTo({ x: proximo * larguraTela, animated: true });
    }

    async function compartilharRetrospectiva() {
        if (!cartaoCompartilhamentoRef.current || compartilhando) return;
        setCompartilhando(true);
        try {
            const disponivel = await Sharing.isAvailableAsync();
            if (!disponivel) {
                Alert.alert("Compartilhamento indisponível", "Este dispositivo não oferece um app para compartilhar a imagem.");
                return;
            }

            const imagem = await captureRef(cartaoCompartilhamentoRef, {
                format: "png",
                quality: 1,
                result: "tmpfile",
                width: 1080,
                height: Math.round(1080 * alturaCartaoCompartilhamento / larguraCartaoCompartilhamento),
            });
            await Sharing.shareAsync(imagem, {
                mimeType: "image/png",
                dialogTitle: "Compartilhar Minha Maré",
                UTI: "public.png",
            });
        } catch (erroCompartilhamento) {
            console.error("Erro ao gerar ou compartilhar a retrospectiva:", erroCompartilhamento);
            Alert.alert("Não foi possível compartilhar", "Tente novamente em instantes.");
        } finally {
            setCompartilhando(false);
        }
    }

    function renderizarSlide(tipo: TelaRetrospectiva) {
        const generoPrincipal = generosEmDestaque[0];
        const artistaPrincipal = artistasEmDestaque[0];

        if (tipo === "abertura") {
            return (
                <>
                    {capaParaPaleta ? (
                        <Image source={{ uri: capaParaPaleta }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
                    ) : null}
                    <LinearGradient
                        colors={["rgba(7,10,16,0.26)", "rgba(7,10,16,0.68)", "rgba(7,10,16,0.98)"]}
                        locations={[0, 0.45, 1]}
                        className="absolute inset-0"
                    />
                    <View className="absolute -right-14 -top-10 h-52 w-52 rounded-full" style={{ backgroundColor: corComOpacidade(corDominante, 0.2) }} />
                    <View className="flex-1 justify-between p-6">
                        <View className="flex-row items-center self-start rounded-full border border-white/15 bg-black/25 px-3 py-2">
                            <MusicNotesIcon size={15} color={corAcento} weight="fill" />
                            <Text style={{ color: corAcento }} className="ml-2 text-[10px] font-bold tracking-[1.4px]">SUA RETROSPECTIVA</Text>
                        </View>
                        <View className="rounded-2xl border border-white/10 bg-black/75 p-5">
                            <Text className="font-serif text-[38px] leading-[44px] text-white">
                                Sua Maré, faixa a faixa.
                            </Text>
                            <Text className="mt-3 text-sm leading-5 text-[#E0E5ED]">
                                Uma história construída pelas músicas que você avaliou.
                            </Text>
                            <View className="mt-6 flex-row items-center">
                                <Text style={{ color: corAcento }} className="text-xs font-semibold">Deslize ou avance para começar</Text>
                                <ArrowRightIcon size={15} color={corAcento} style={{ marginLeft: 6 }} />
                            </View>
                        </View>
                    </View>
                </>
            );
        }

        if (tipo === "resumo") {
            return (
                <View className="flex-1 justify-between p-6">
                    <View className="flex-row items-center">
                        <ChartBarIcon size={17} color={corAcento} />
                        <Text style={{ color: corAcento }} className="ml-2 text-[10px] font-bold tracking-[1.4px]">SEU RETRATO MUSICAL</Text>
                    </View>
                    <View className="rounded-2xl border border-white/10 bg-black/45 p-4">
                        <Text className="font-serif text-[30px] leading-9 text-white">Cada nota conta um pedaço da sua história.</Text>
                        <Text className="mt-5 text-[64px] font-semibold leading-[70px] text-white">{dados?.totalAvaliacoes ?? 0}</Text>
                        <Text className="text-sm text-[#B7C1D0]">{formatarQuantidade(dados?.totalAvaliacoes ?? 0, "música avaliada", "músicas avaliadas")}</Text>
                    </View>
                    <View className="flex-row rounded-2xl border border-white/10 bg-black/60 p-4">
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase tracking-wider text-[#AAB4C5]">Sua nota média</Text>
                            <View className="mt-2 flex-row items-center">
                                <StarIcon size={18} color={corAcento} weight="fill" />
                                <Text className="ml-2 text-2xl font-semibold text-white">
                                    {dados?.totalAvaliacoes ? formatarNota(dados.mediaGeral) : "—"}
                                </Text>
                            </View>
                        </View>
                        <View className="mx-4 w-px bg-white/10" />
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase tracking-wider text-[#AAB4C5]">Artistas avaliados</Text>
                            <Text className="mt-2 text-2xl font-semibold text-white">{dados?.artistas.length ?? 0}</Text>
                        </View>
                    </View>
                    {dados?.totalAvaliacoes === 0 ? (
                        <Pressable onPress={() => router.push("/criar")} className="flex-row items-center self-start py-1">
                            <Text style={{ color: corAcento }} className="text-sm font-semibold">Fazer a primeira avaliação</Text>
                            <ArrowRightIcon size={16} color={corAcento} style={{ marginLeft: 6 }} />
                        </Pressable>
                    ) : null}
                </View>
            );
        }

        if (tipo === "generos") {
            return (
                <View className="flex-1 p-6">
                    <View className="flex-row items-center">
                        <MusicNotesIcon size={17} color={corAcento} />
                        <Text style={{ color: corAcento }} className="ml-2 text-[10px] font-bold tracking-[1.4px]">SEUS GÊNEROS</Text>
                    </View>
                    <Text className="mt-7 rounded-xl bg-black/60 px-3 py-2 font-serif text-[28px] leading-9 text-white">O som que mais aparece no seu universo</Text>
                    {generoPrincipal ? (
                        <View className="mt-5 rounded-2xl border border-white/10 bg-black/60 p-4">
                            <Text className="text-xs text-[#AAB4C5]">Seu gênero principal</Text>
                            <Text style={{ color: corAcento }} className="mt-2 font-serif text-3xl">{generoPrincipal.nome}</Text>
                            <Text className="mt-1 text-xs text-[#B7C1D0]">
                                {formatarQuantidade(generoPrincipal.quantidade, "avaliação", "avaliações")}
                            </Text>
                        </View>
                    ) : null}
                    <View className="mt-5 flex-1 justify-center">
                        {generosEmDestaque.slice(0, 4).map((genero, posicao) => {
                            const maior = Math.max(1, generoPrincipal?.quantidade ?? 1);
                            return (
                                <View key={genero.nome} className="mb-4">
                                    <View className="mb-2 flex-row items-center justify-between">
                                        <Text className="text-sm text-white">{genero.nome}</Text>
                                        <Text className="text-xs text-[#AAB4C5]">{genero.quantidade}</Text>
                                    </View>
                                    <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(genero.quantidade / maior) * 100}%`,
                                                backgroundColor: posicao === 0 ? corAcento : corComOpacidade(corDominante, Math.max(0.4, 0.82 - posicao * 0.12)),
                                            }}
                                        />
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    <Text className="text-xs text-[#AAB4C5]">Distribuição baseada nas suas avaliações.</Text>
                </View>
            );
        }

        if (tipo === "artistas") {
            return (
                <>
                    {artistaPrincipal?.fotoURL ? (
                        <Image source={{ uri: artistaPrincipal.fotoURL }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
                    ) : null}
                    <LinearGradient
                        colors={["rgba(7,10,16,0.26)", "rgba(7,10,16,0.7)", "rgba(7,10,16,0.98)"]}
                        locations={[0, 0.48, 1]}
                        className="absolute inset-0"
                    />
                    <View className="flex-1 justify-between p-6">
                        <View className="self-start rounded-full border border-white/15 bg-black/25 px-3 py-2">
                            <Text style={{ color: corAcento }} className="text-[10px] font-bold tracking-[1.4px]">ARTISTA EM DESTAQUE</Text>
                        </View>
                        <View className="rounded-2xl border border-white/10 bg-black/75 p-5">
                            <Text className="text-sm font-semibold text-white/80">Nº 1 NO SEU UNIVERSO</Text>
                            <Text className="mt-2 font-serif text-[36px] leading-[42px] text-white" numberOfLines={2}>
                                {artistaPrincipal?.nome ?? "Seus artistas"}
                            </Text>
                            <Text className="mt-2 text-sm text-[#D1D7E0]">
                                {formatarQuantidade(artistaPrincipal?.quantidade ?? 0, "avaliação sua", "avaliações suas")}
                            </Text>
                            {artistasEmDestaque.length > 1 ? (
                                <View className="mt-5 flex-row flex-wrap">
                                    {artistasEmDestaque.slice(1, 4).map((artista) => (
                                        <View key={artista.id} className="mr-2 mt-2 rounded-full border border-white/15 bg-black/25 px-3 py-2">
                                            <Text className="text-xs text-white">{artista.nome}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : null}
                        </View>
                    </View>
                </>
            );
        }

        if (tipo === "trajetoria") {
            return (
                <View className="flex-1 justify-between p-6">
                    <View className="flex-row items-center">
                        <ChartBarIcon size={17} color={corAcento} />
                        <Text style={{ color: corAcento }} className="ml-2 text-[10px] font-bold tracking-[1.4px]">SUA TRAJETÓRIA</Text>
                    </View>
                    <View className="rounded-2xl border border-white/10 bg-black/65 p-4">
                        <Text className="font-serif text-[30px] leading-9 text-white">Seu ritmo de avaliações nos últimos meses.</Text>
                        <Text className="mt-2 text-sm text-[#B7C1D0]">Cada barra representa avaliações registradas naquele mês.</Text>
                    </View>
                    <View className="h-[190px] flex-row items-end rounded-2xl border border-white/10 bg-black/60 px-3 pt-4">
                        {mesesTrajetoria.map((mes) => (
                            <View key={mes.chave} className="h-full flex-1 items-center justify-end px-1">
                                <Text className="mb-2 text-xs text-[#D7DEE8]">{mes.quantidade > 0 ? mes.quantidade : ""}</Text>
                                <View
                                    className="w-full max-w-8 rounded-t-lg"
                                    style={{
                                        height: mes.quantidade > 0 ? Math.max(9, 112 * mes.quantidade / maiorMes) : 3,
                                        backgroundColor: mes.quantidade > 0 ? corDominante : "rgba(255,255,255,0.12)",
                                        shadowColor: corAcento,
                                        shadowOpacity: mes.quantidade > 0 ? 0.48 : 0,
                                        shadowRadius: 12,
                                        elevation: mes.quantidade > 0 ? 4 : 0,
                                    }}
                                />
                                <Text className="mb-3 mt-2 text-[10px] capitalize text-[#AAB4C5]">{mes.nome}</Text>
                            </View>
                        ))}
                    </View>
                    <Text className="text-xs text-[#AAB4C5]">{formatarQuantidade(mesesComAvaliacoes, "mês com avaliações", "meses com avaliações")}</Text>
                </View>
            );
        }

        return (
            <View className="flex-1 p-5">
                <View className="flex-row items-center">
                    <StarIcon size={17} color={corAcento} weight="fill" />
                    <Text style={{ color: corAcento }} className="ml-2 text-[10px] font-bold tracking-[1.4px]">SUA COLEÇÃO</Text>
                </View>
                <View className="mt-4 rounded-2xl border border-white/10 bg-black/65 p-4">
                    <Text className="font-serif text-[26px] leading-8 text-white" numberOfLines={2}>
                        Músicas que você guardou para voltar.
                    </Text>
                    <Text className="mt-2 text-sm text-[#B7C1D0]">
                        {formatarQuantidade(musicasSalvas.length, "música salva", "músicas salvas")}
                    </Text>
                </View>
                {erroColecao ? (
                    <Text className="text-sm text-[#B7C1D0]">{erroColecao}</Text>
                ) : (
                    <View className="mt-5 flex-row items-start justify-center pb-4">
                        {musicasSalvas.slice(0, 3).map(({ musica }, posicao) => (
                            <Pressable
                                key={musica.id}
                                onPress={() => router.push(`/musica/${musica.id}` as never)}
                                accessibilityRole="button"
                                accessibilityLabel={`Abrir ${musica.titulo}`}
                                className="mx-1.5 min-w-0 flex-1"
                                style={{ transform: [{ translateY: posicao === 1 ? -10 : 0 }] }}
                            >
                                <Image
                                    source={musica.capa ? { uri: musica.capa } : imagemPadrao}
                                    className="aspect-square w-full rounded-2xl border border-white/15 bg-[#171E2B]"
                                    resizeMode="cover"
                                />
                                <Text className="mt-2 text-xs leading-4 font-semibold text-white" numberOfLines={1} ellipsizeMode="tail">
                                    {musica.titulo}
                                </Text>
                                <Text className="mt-1 text-[10px] leading-4 text-[#AAB4C5]" numberOfLines={1} ellipsizeMode="tail">
                                    {musica.artista?.nome ?? "Artista desconhecido"}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar tipo="voltar" />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={atualizando}
                        onRefresh={() => void carregar(true)}
                        tintColor="#58AAF0"
                        colors={["#58AAF0"]}
                    />
                }
            >
                {carregando ? (
                    <View className="py-14 items-center">
                        <ActivityIndicator color="#58AAF0" size="large" />
                        <Text className="mt-3 text-sm text-[#718096]">Preparando sua retrospectiva...</Text>
                    </View>
                ) : erro ? (
                    <View className="mx-5 mt-6 rounded-2xl border border-[#354052] bg-[#111420] p-5">
                        <Text className="text-center text-sm text-red-400">{erro}</Text>
                        <Pressable onPress={() => void carregar()} className="mt-4 items-center rounded-xl bg-[#1C314B] py-3">
                            <Text className="text-sm text-white">Tentar novamente</Text>
                        </Pressable>
                    </View>
                ) : dados ? (
                    <>
                        <View className="mx-5 mt-2 flex-row items-center justify-between">
                            <View>
                                <Text className="font-serif text-2xl text-white">Minha Maré</Text>
                                <Text className="mt-1 text-xs text-[#8793A7]">Uma retrospectiva do seu gosto.</Text>
                            </View>
                            <Text className="text-xs font-medium text-[#8793A7]">{indiceSeguro + 1} / {slides.length}</Text>
                        </View>

                        <View className="mx-5 mt-5 flex-row">
                            {slides.map((slide, indice) => (
                                <Pressable
                                    key={slide}
                                    onPress={() => irParaSlide(indice)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Ir para parte ${indice + 1}`}
                                    className="mr-1.5 h-1 flex-1 overflow-hidden rounded-full bg-white/15"
                                >
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            width: indice <= indiceSeguro ? "100%" : "0%",
                                            backgroundColor: indice === indiceSeguro ? corAcento : "#FFFFFF",
                                        }}
                                    />
                                </Pressable>
                            ))}
                        </View>

                        <ScrollView
                            ref={carrosselRef}
                            className="mt-4"
                            horizontal
                            pagingEnabled
                            bounces={false}
                            showsHorizontalScrollIndicator={false}
                            scrollEventThrottle={16}
                            onMomentumScrollEnd={(evento) => {
                                setIndiceAtivo(Math.round(evento.nativeEvent.contentOffset.x / larguraTela));
                            }}
                        >
                            {slides.map((slide, indice) => (
                                <View key={slide} style={{ width: larguraTela, paddingHorizontal: 20 }}>
                                    <Animated.View
                                        className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#111622]"
                                        style={{
                                            height: slide === "colecao" ? alturaCartaoColecao : alturaCartao,
                                            opacity: indice === indiceSeguro ? animacaoConteudo : 1,
                                            transform: [{
                                                translateY: indice === indiceSeguro
                                                    ? animacaoConteudo.interpolate({ inputRange: [0, 1], outputRange: [14, 0] })
                                                    : 0,
                                            }],
                                        }}
                                    >
                                        <LinearGradient
                                            colors={[corComOpacidade(corDominante, 0.2), "#111622", "#0C1019"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            className="absolute inset-0"
                                        />
                                        {renderizarSlide(slide)}
                                    </Animated.View>
                                </View>
                            ))}
                        </ScrollView>

                        <View className="mx-5 mt-5 flex-row items-center justify-between">
                            <Pressable
                                onPress={() => irParaSlide(indiceSeguro - 1)}
                                disabled={indiceSeguro === 0}
                                accessibilityRole="button"
                                accessibilityLabel="Voltar uma parte"
                                className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[#111420]"
                                style={{ opacity: indiceSeguro === 0 ? 0.38 : 1 }}
                            >
                                <ArrowLeftIcon size={19} color="#D0D7E2" />
                            </Pressable>
                            <Text className="text-xs text-[#8793A7]">
                                {indiceSeguro < slides.length - 1 ? "Deslize para continuar" : "Sua retrospectiva está pronta"}
                            </Text>
                            <Pressable
                                onPress={() => indiceSeguro < slides.length - 1 ? irParaSlide(indiceSeguro + 1) : setCompartilhamentoAberto(true)}
                                accessibilityRole="button"
                                accessibilityLabel={indiceSeguro < slides.length - 1 ? "Avançar uma parte" : "Compartilhar retrospectiva"}
                                className="h-11 w-11 items-center justify-center rounded-full"
                                style={{ backgroundColor: corAcento }}
                            >
                                {indiceSeguro < slides.length - 1
                                    ? <ArrowRightIcon size={20} color="#07111E" weight="bold" />
                                    : <ShareNetworkIcon size={19} color="#07111E" weight="bold" />}
                            </Pressable>
                        </View>
                    </>
                ) : null}
            </ScrollView>

            <Modal
                visible={compartilhamentoAberto}
                transparent
                animationType="fade"
                onRequestClose={() => setCompartilhamentoAberto(false)}
            >
                <ScrollView
                    className="flex-1 bg-black/85"
                    contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="w-full items-center">
                        <Text className="mb-4 text-base font-semibold text-white">Prévia da retrospectiva</Text>
                        <View
                            ref={cartaoCompartilhamentoRef}
                            collapsable={false}
                            className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[#101622]"
                            style={{
                                width: larguraCartaoCompartilhamento,
                                height: alturaCartaoCompartilhamento,
                            }}
                        >
                            {capaParaPaleta ? (
                                <Image source={{ uri: capaParaPaleta }} className="absolute inset-0 h-full w-full" resizeMode="cover" />
                            ) : null}
                            <LinearGradient
                                colors={["rgba(5,9,16,0.4)", "rgba(5,9,16,0.84)", "rgba(5,9,16,0.99)"]}
                                locations={[0, 0.45, 1]}
                                className="absolute inset-0"
                            />
                            <View
                                pointerEvents="none"
                                className="absolute -right-12 -top-10 h-48 w-48 rounded-full"
                                style={{ backgroundColor: corComOpacidade(corDominante, 0.22) }}
                            />
                            <View className="flex-1 justify-between p-6">
                                <View className="flex-row items-center self-start rounded-full border border-white/15 bg-black/50 px-3 py-2">
                                    <MusicNotesIcon size={14} color={corAcento} weight="fill" />
                                    <Text style={{ color: corAcento }} className="ml-2 text-[10px] font-bold tracking-[1.5px]">MARÉ · RETROSPECTIVA</Text>
                                </View>
                                <View>
                                    <Text className="font-serif text-[30px] leading-9 text-white">Minha Maré</Text>
                                    <Text className="mt-2 text-sm text-[#E0E5ED]">Um retrato feito pelas músicas que avaliei.</Text>
                                    <View className="mt-6 rounded-2xl border border-white/10 bg-black/60 p-4">
                                        <Text className="text-[64px] font-semibold leading-[70px] text-white">{dados?.totalAvaliacoes ?? 0}</Text>
                                        <Text className="text-sm text-[#D1D7E0]">
                                            {formatarQuantidade(dados?.totalAvaliacoes ?? 0, "música avaliada", "músicas avaliadas")}
                                        </Text>
                                    </View>
                                    <View className="mt-3 flex-row">
                                        <View className="flex-1 rounded-xl border border-white/10 bg-black/55 p-3">
                                            <Text className="text-[10px] uppercase tracking-wider text-[#AAB4C5]">Nota média</Text>
                                            <View className="mt-1.5 flex-row items-center">
                                                <StarIcon size={15} color={corAcento} weight="fill" />
                                                <Text className="ml-1.5 text-xl font-semibold text-white">
                                                    {dados?.totalAvaliacoes ? formatarNota(dados.mediaGeral) : "—"}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className="ml-3 flex-1 rounded-xl border border-white/10 bg-black/55 p-3">
                                            <Text className="text-[10px] uppercase tracking-wider text-[#AAB4C5]">Artistas</Text>
                                            <Text className="mt-1.5 text-xl font-semibold text-white">{dados?.artistas.length ?? 0}</Text>
                                        </View>
                                    </View>
                                    {(generosEmDestaque[0] || artistasEmDestaque[0]) ? (
                                        <View className="mt-3 rounded-xl border border-white/10 bg-black/55 p-3">
                                            {generosEmDestaque[0] ? (
                                                <Text className="text-xs text-[#E0E5ED]" numberOfLines={1}>
                                                    Gênero em destaque · <Text style={{ color: corAcento }}>{generosEmDestaque[0].nome}</Text>
                                                </Text>
                                            ) : null}
                                            {artistasEmDestaque[0] ? (
                                                <Text className="mt-1 text-xs text-[#E0E5ED]" numberOfLines={1}>
                                                    Artista em destaque · <Text style={{ color: corAcento }}>{artistasEmDestaque[0].nome}</Text>
                                                </Text>
                                            ) : null}
                                        </View>
                                    ) : null}
                                </View>
                                <Text style={{ color: corAcento }} className="text-[10px] font-semibold tracking-[1.5px]">MARE · MEU SOM, MINHA MARÉ</Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={() => void compartilharRetrospectiva()}
                            disabled={compartilhando}
                            accessibilityRole="button"
                            className="mt-5 h-12 w-full flex-row items-center justify-center rounded-xl"
                            style={{ backgroundColor: corAcento, opacity: compartilhando ? 0.7 : 1, maxWidth: 360 }}
                        >
                            <ShareNetworkIcon size={18} color="#07111E" weight="bold" />
                            <Text className="ml-2 text-sm font-semibold text-[#07111E]">
                                {compartilhando ? "Preparando imagem..." : "Compartilhar imagem"}
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setCompartilhamentoAberto(false)}
                            accessibilityRole="button"
                            className="mt-2 py-3"
                        >
                            <Text className="text-sm text-[#AAB4C5]">Voltar à retrospectiva</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </Modal>
            <Navbar />
        </SafeAreaView>
    );
}

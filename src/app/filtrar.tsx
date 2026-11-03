import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    MagnifyingGlassIcon,
    MusicNotesIcon,
    XIcon,
} from "phosphor-react-native";

import Topbar from "../components/topbar";
import FotoArtista from "../components/FotoArtista";
import { buscarArtistas, type Artista } from "../services/artistaService";
import {
    buscarGenerosDisponiveis,
    salvarArtistasFavoritos,
    salvarGenerosFavoritos,
} from "../services/preferenciaService";
import { buscarGenerosFavoritos, buscarMeuPerfil } from "../services/usuarioService";
import { feedbackSelecao } from "../services/feedbackTatil";

type EtapaPreferencias = 1 | 2;

function normalizar(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

export default function EscolherPreferencias() {
    const roteador = useRouter();
    const { modo } = useLocalSearchParams<{ modo?: string }>();
    const editandoGeneros = modo === "generos";

    const [etapa, setEtapa] = useState<EtapaPreferencias>(1);
    const etapaArtistas = !editandoGeneros && etapa === 2;
    const [generosDisponiveis, setGenerosDisponiveis] = useState<string[]>([]);
    const [artistasDisponiveis, setArtistasDisponiveis] = useState<Artista[]>([]);
    const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
    const [artistasSelecionados, setArtistasSelecionados] = useState<number[]>([]);
    const [pesquisaGenero, setPesquisaGenero] = useState("");
    const [pesquisaArtista, setPesquisaArtista] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [carregandoArtistas, setCarregandoArtistas] = useState(false);
    const [erroArtistas, setErroArtistas] = useState("");
    const [revisaoArtistas, setRevisaoArtistas] = useState(0);
    const [artistasCarregados, setArtistasCarregados] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    // A tela inicial busca só o perfil e os gêneros; o catálogo de artistas é carregado sob demanda.
    useEffect(() => {
        let ativo = true;

        async function carregarCatalogo() {
            try {
                const [perfil, generos, generosSalvos] = await Promise.all([
                    buscarMeuPerfil(),
                    buscarGenerosDisponiveis(),
                    editandoGeneros
                        ? buscarGenerosFavoritos()
                        : Promise.resolve([] as string[]),
                ]);

                if (!ativo) return;

                if (!editandoGeneros && perfil.preferenciasConcluidas) {
                    roteador.replace("/home");
                    return;
                }

                setGenerosDisponiveis(
                    [...new Set([...generos, ...generosSalvos])].sort((a, b) =>
                        a.localeCompare(b, "pt-BR"),
                    ),
                );
                setGenerosSelecionados(generosSalvos);
            } catch (erroCatalogo) {
                if (!ativo) return;
                setErro(
                    erroCatalogo instanceof Error
                        ? erroCatalogo.message
                        : "Não foi possível carregar o catálogo musical.",
                );
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        void carregarCatalogo();
        return () => {
            ativo = false;
        };
    }, [editandoGeneros, roteador]);

    // Busca artistas quando a pessoa chega à etapa correspondente, sem atrasar a tela de gêneros.
    useEffect(() => {
        if (!etapaArtistas || artistasCarregados) return;

        let ativo = true;
        setCarregandoArtistas(true);
        setErroArtistas("");

        buscarArtistas()
            .then((artistas) => {
                if (!ativo) return;
                // O backend já entrega o catálogo em ordem alfabética.
                setArtistasDisponiveis(artistas);
                setArtistasCarregados(true);
            })
            .catch((erroCatalogo) => {
                if (!ativo) return;
                setErroArtistas(
                    erroCatalogo instanceof Error
                        ? erroCatalogo.message
                        : "Não foi possível carregar os artistas.",
                );
            })
            .finally(() => {
                if (ativo) setCarregandoArtistas(false);
            });

        return () => { ativo = false; };
    }, [etapaArtistas, artistasCarregados, revisaoArtistas]);

    const generosFiltrados = useMemo(
        () =>
            generosDisponiveis.filter((genero) =>
                normalizar(genero).includes(normalizar(pesquisaGenero.trim())),
            ),
        [generosDisponiveis, pesquisaGenero],
    );

    const artistasFiltrados = useMemo(
        () =>
            artistasDisponiveis.filter((artista) =>
                normalizar(artista.nome).includes(normalizar(pesquisaArtista.trim())),
            ),
        [artistasDisponiveis, pesquisaArtista],
    );

    function alternarGenero(genero: string) {
        feedbackSelecao();
        setGenerosSelecionados((atuais) =>
            atuais.includes(genero)
                ? atuais.filter((item) => item !== genero)
                : [...atuais, genero],
        );
        setErro("");
    }

    function alternarArtista(artistaId: number) {
        feedbackSelecao();
        setArtistasSelecionados((atuais) =>
            atuais.includes(artistaId)
                ? atuais.filter((id) => id !== artistaId)
                : [...atuais, artistaId],
        );
        setErro("");
    }

    async function avancarOuSalvar() {
        if (salvando) return;

        if (generosSelecionados.length === 0) {
            setErro("Selecione pelo menos um gênero musical.");
            setEtapa(1);
            return;
        }

        if (!editandoGeneros && etapa === 1) {
            setEtapa(2);
            setErro("");
            return;
        }

        if (!editandoGeneros && artistasSelecionados.length === 0) {
            setErro("Selecione pelo menos um artista.");
            return;
        }

        setSalvando(true);
        setErro("");

        try {
            if (!editandoGeneros) {
                await salvarArtistasFavoritos(artistasSelecionados);
            }
            await salvarGenerosFavoritos(generosSelecionados);

            if (editandoGeneros) {
                roteador.back();
            } else {
                roteador.replace("/home");
            }
        } catch (erroAoSalvar) {
            setErro(
                erroAoSalvar instanceof Error
                    ? erroAoSalvar.message
                    : "Não foi possível salvar suas preferências.",
            );
        } finally {
            setSalvando(false);
        }
    }

    const pesquisaAtual = etapaArtistas ? pesquisaArtista : pesquisaGenero;
    const alterarPesquisa = etapaArtistas ? setPesquisaArtista : setPesquisaGenero;

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar
                titulo={editandoGeneros ? "Gêneros favoritos" : "Suas preferências"}
                subtitulo={
                    editandoGeneros
                        ? "Personalize as músicas que aparecem para você"
                        : etapaArtistas
                          ? "Escolha artistas que você gosta"
                          : "Escolha seus estilos musicais favoritos"
                }
                tipo={editandoGeneros ? "voltar" : "simples"}
            />

            {!editandoGeneros ? (
                <View className="flex-row justify-center px-6 pb-4">
                    {[1, 2].map((numero) => (
                        <View key={numero} className="flex-row items-center">
                            <View
                                className={`w-8 h-8 rounded-full items-center justify-center ${etapa >= numero ? "bg-[#58AAF0]" : "bg-[#F4F7FA] dark:bg-[#171E2B] border border-[#C5D3E1] dark:border-[#354052]"}`}
                            >
                                <Text
                                    className={`text-xs font-semibold ${etapa >= numero ? "text-[#080A10]" : "text-[#52677F] dark:text-[#9AA6BA]"}`}
                                >
                                    {etapa > numero ? "✓" : numero}
                                </Text>
                            </View>
                            {numero === 1 ? (
                                <View className="w-12 h-px bg-[#354052] mx-2" />
                            ) : null}
                        </View>
                    ))}
                </View>
            ) : null}

            <View className="mx-5 mb-4 flex-row items-center rounded-xl border border-[#29384B] bg-[#EAF1F8] dark:bg-[#0D1520] px-3">
                <MagnifyingGlassIcon size={19} color="#8495A9" />
                <TextInput
                    className="flex-1 py-3 px-3 text-sm text-[#142338] dark:text-white"
                    value={pesquisaAtual}
                    onChangeText={alterarPesquisa}
                    placeholder={etapaArtistas ? "Buscar artista..." : "Buscar gênero musical..."}
                    placeholderTextColor="#738196"
                    autoCapitalize="none"
                />
                {pesquisaAtual ? (
                    <Pressable onPress={() => alterarPesquisa("")} accessibilityLabel="Limpar pesquisa">
                        <XIcon size={18} color="#8495A9" />
                    </Pressable>
                ) : null}
            </View>

            {carregando || (etapaArtistas && carregandoArtistas) ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#58AAF0" />
                    <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm mt-3">
                        {etapaArtistas ? "Carregando artistas..." : "Carregando catálogo..."}
                    </Text>
                </View>
            ) : etapaArtistas ? (
                <FlatList
                    className="flex-1"
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16, flexGrow: 1 }}
                    columnWrapperStyle={{ justifyContent: "space-between" }}
                    data={artistasFiltrados}
                    numColumns={2}
                    keyExtractor={(artista) => String(artista.id)}
                    initialNumToRender={8}
                    maxToRenderPerBatch={8}
                    windowSize={5}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-10">
                            <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm text-center">
                                {erroArtistas
                                    ? erroArtistas
                                    : artistasDisponiveis.length === 0
                                      ? "Ainda não há artistas no catálogo."
                                      : "Nenhum artista corresponde à pesquisa."}
                            </Text>
                            {erroArtistas ? (
                                <Pressable
                                    onPress={() => setRevisaoArtistas((revisao) => revisao + 1)}
                                    className="mt-3 rounded-lg border border-[#C5D3E1] dark:border-[#354052] px-4 py-2"
                                >
                                    <Text className="text-[#155B91] dark:text-[#58AAF0] text-sm">Tentar novamente</Text>
                                </Pressable>
                            ) : null}
                        </View>
                    }
                    renderItem={({ item: artista }) => {
                        const selecionado = artistasSelecionados.includes(artista.id);
                        return (
                            <Pressable
                                onPress={() => alternarArtista(artista.id)}
                                accessibilityRole="checkbox"
                                accessibilityState={{ checked: selecionado }}
                                className={`w-[48%] mb-3 p-3 rounded-xl border items-center ${selecionado ? "border-[#58AAF0] bg-[#142438]" : "border-[#293342] bg-[#101722]"}`}
                            >
                                <FotoArtista
                                    url={artista.fotoURL}
                                    style={{ width: "100%", aspectRatio: 1, borderRadius: 8, marginBottom: 12, backgroundColor: "#1B2A3B" }}
                                />
                                <View className="w-full flex-row items-center justify-between">
                                    <Text className="flex-1 text-[#142338] dark:text-white text-sm" numberOfLines={1}>
                                        {artista.nome}
                                    </Text>
                                    {selecionado ? <CheckIcon size={18} color="#58AAF0" weight="bold" /> : null}
                                </View>
                            </Pressable>
                        );
                    }}
                />
            ) : (
                <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
                    {generosFiltrados.length > 0 ? (
                        <View className="flex-row flex-wrap">
                            {generosFiltrados.map((genero) => {
                                const selecionado = generosSelecionados.includes(genero);
                                return (
                                    <Pressable
                                        key={genero}
                                        onPress={() => alternarGenero(genero)}
                                        accessibilityRole="checkbox"
                                        accessibilityState={{ checked: selecionado }}
                                        className={`mr-2 mb-2 px-4 py-3 rounded-full border flex-row items-center ${selecionado ? "border-[#58AAF0] bg-[#142438]" : "border-[#293342] bg-[#101722]"}`}
                                    >
                                        <MusicNotesIcon size={16} color={selecionado ? "#58AAF0" : "#9AA6BA"} />
                                        <Text className="text-[#142338] dark:text-white text-sm ml-2">{genero}</Text>
                                        {selecionado ? (
                                            <View className="ml-2">
                                                <CheckIcon size={15} color="#58AAF0" weight="bold" />
                                            </View>
                                        ) : null}
                                    </Pressable>
                                );
                            })}
                        </View>
                    ) : (
                        <Text className="text-[#52677F] dark:text-[#9AA6BA] text-sm text-center py-10">
                            {generosDisponiveis.length === 0
                                ? "Ainda não há gêneros no catálogo."
                                : "Nenhum gênero corresponde à pesquisa."}
                        </Text>
                    )}
                </ScrollView>
            )}

            <View className="px-5 pt-4 pb-3 border-t border-[#D5E0EC] dark:border-[#202633]">
                {erro ? (
                    <Text className="text-red-400 text-sm mb-3 text-center">{erro}</Text>
                ) : null}
                <Text className="text-[#52677F] dark:text-[#9AA6BA] text-xs text-center mb-3">
                    {etapaArtistas
                        ? `${artistasSelecionados.length} artista(s) selecionado(s)`
                        : `${generosSelecionados.length} gênero(s) selecionado(s)`}
                </Text>
                <View className="flex-row justify-between">
                    {etapaArtistas ? (
                        <Pressable
                            disabled={salvando}
                            onPress={() => {
                                setEtapa(1);
                                setErro("");
                            }}
                            className="flex-row items-center px-4 py-3 rounded-full border border-[#C5D3E1] dark:border-[#354052]"
                        >
                            <ArrowLeftIcon size={18} color="#D0D0D5" />
                            <Text className="text-[#142338] dark:text-white text-sm ml-2">Voltar</Text>
                        </Pressable>
                    ) : <View />}
                    <Pressable
                        disabled={carregando || carregandoArtistas || salvando}
                        onPress={() => void avancarOuSalvar()}
                        className="flex-row items-center px-5 py-3 rounded-full bg-[#58AAF0] disabled:opacity-60"
                    >
                        {carregandoArtistas ? (
                            <>
                                <ActivityIndicator size="small" color="#080A10" />
                                <Text className="text-[#07111E] text-sm font-semibold ml-2">Carregando artistas...</Text>
                            </>
                        ) : salvando ? (
                            <ActivityIndicator size="small" color="#080A10" />
                        ) : (
                            <>
                                <Text className="text-[#07111E] text-sm font-semibold">
                                    {editandoGeneros
                                        ? "Salvar gêneros"
                                        : etapaArtistas
                                          ? "Concluir"
                                          : "Escolher artistas"}
                                </Text>
                                {!editandoGeneros && !etapaArtistas ? (
                                    <View className="ml-2">
                                        <ArrowRightIcon size={18} color="#07111E" />
                                    </View>
                                ) : null}
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

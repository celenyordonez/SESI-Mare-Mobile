import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckIcon, MagnifyingGlassIcon, StarIcon, XIcon } from "phosphor-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Topbar from "../components/topbar";
import PlataformaMusicalIcon from "../components/PlataformaMusicalIcon";
import EstrelaNota from "../components/EstrelaNota";
import { buscarMusicas } from "../services/musicaService";
import { buscarArtistasFavoritos, buscarGenerosFavoritos } from "../services/usuarioService";
import { criarPost } from "../services/postService";
import type { Musica } from "../services/musicaService";
import type { ArtistaFavorito } from "../services/usuarioService";

export default function Criar() {
    const router = useRouter();
    const scrollRef = useRef<ScrollViewInstance | null>(null);
    const { musica: musicaIdParam } = useLocalSearchParams<{ musica?: string }>();
    const [musicas, setMusicas] = useState<Musica[]>([]);
    const [generosFavoritos, setGenerosFavoritos] = useState<string[]>([]);
    const [artistasFavoritos, setArtistasFavoritos] = useState<ArtistaFavorito[]>([]);
    const [busca, setBusca] = useState("");
    const [selecionada, setSelecionada] = useState<Musica | null>(null);
    const [nota, setNota] = useState(0);
    const [texto, setTexto] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [publicando, setPublicando] = useState(false);

    useEffect(() => {
        let ativo = true;
        Promise.all([
            buscarMusicas(),
            buscarGenerosFavoritos().catch(() => []),
            buscarArtistasFavoritos().catch(() => []),
        ])
            .then(([dados, generos, artistas]) => {
                if (!ativo) return;
                setMusicas(dados); setGenerosFavoritos(generos); setArtistasFavoritos(artistas);
                const indicada = dados.find((musica) => musica.id === Number(musicaIdParam));
                if (indicada) setSelecionada(indicada);
            })
            .catch((error) => {
                console.error("Erro ao carregar músicas:", error);
                Toast.show({ type: "error", text1: "Não foi possível carregar as músicas." });
            })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, [musicaIdParam]);

    const idsFavoritos = new Set(artistasFavoritos.map((item) => item.artistaId));
    const generosNormalizados = new Set(generosFavoritos.map((item) => item.trim().toLocaleLowerCase("pt-BR")));
    const recomendadas = musicas.filter((musica) => (musica.genero && generosNormalizados.has(musica.genero.trim().toLocaleLowerCase("pt-BR"))) || (musica.artista?.id != null && idsFavoritos.has(musica.artista.id))).slice(0, 8);
    const linksOuvir = selecionada ? [
        { nome: "Spotify" as const, url: selecionada.spotifyUrl ?? "" },
        { nome: "Apple Music" as const, url: selecionada.appleMusicUrl ?? "" },
        { nome: "Amazon Music" as const, url: selecionada.amazonMusicUrl ?? "" },
        { nome: "YouTube Music" as const, url: selecionada.youtubeMusicUrl ?? "" },
    ].filter((item) => item.url.length > 0) : [];

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        if (!termo) return musicas;
        return musicas.filter((musica) => `${musica.titulo} ${musica.artista?.nome ?? ""}`.toLocaleLowerCase("pt-BR").includes(termo));
    }, [busca, musicas]);

    const podePublicar = Boolean(selecionada && nota > 0 && texto.trim());

    function selecionarMusica(musica: Musica) {
        setSelecionada(musica);
        setNota(0);
        setBusca("");
    }

    async function publicar() {
        if (!selecionada || nota === 0 || !texto.trim()) {
            Toast.show({ type: "error", text1: "Complete sua avaliação", text2: "Escolha uma música, dê uma nota e escreva um comentário." });
            return;
        }
        try {
            setPublicando(true);
            await criarPost({ musicaId: selecionada.id, nota, texto: texto.trim() });
            Toast.show({ type: "success", text1: "Avaliação publicada!" });
            router.replace("/home");
        } catch (error) {
            Toast.show({ type: "error", text1: "Não foi possível publicar", text2: error instanceof Error ? error.message : undefined });
        } finally {
            setPublicando(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar titulo="Criar avaliação" subtitulo="O que você achou dessa música?" tipo="voltar" />
            <KeyboardAvoidingView className="flex-1" behavior="padding">
            <ScrollView ref={scrollRef} className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled" keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"} showsVerticalScrollIndicator={false}>
                <Text className="mb-2 font-serif text-lg text-[#142338] dark:text-white">Escolha uma música</Text>
                <Text className="mb-3 text-xs text-[#52677F] dark:text-[#8793A7]">Sugestões com base nos artistas e gêneros que você curte.</Text>
                {carregando ? (
                    <View className="h-24 items-center justify-center">
                        <ActivityIndicator color="#5EA7ED" />
                        <Text className="mt-2 text-xs text-[#52677F] dark:text-[#718096]">Carregando músicas...</Text>
                    </View>
                ) : recomendadas.length ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1 mb-4" contentContainerStyle={{ paddingHorizontal: 4 }}>
                        {recomendadas.map((musica) => (
                            <Pressable
                                key={musica.id}
                                onPress={() => selecionarMusica(musica)}
                                accessibilityRole="button"
                                accessibilityLabel={"Selecionar " + musica.titulo}
                                className={"mr-3 w-[132px] rounded-xl border p-2 " + (selecionada?.id === musica.id ? "border-[#58AAF0] bg-[#17243A]" : "border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420]")}
                            >
                                <View className="relative">
                                    <Image source={musica.capa ? { uri: musica.capa } : require("../../assets/images/logo.png")} className="aspect-square w-full rounded-lg" resizeMode="cover" />
                                    {selecionada?.id === musica.id && <View className="absolute right-2 top-2 h-6 w-6 items-center justify-center rounded-full bg-[#58AAF0]"><CheckIcon size={14} color="#07111E" weight="bold" /></View>}
                                </View>
                                <Text className="mt-2 text-xs text-[#142338] dark:text-white" numberOfLines={1}>{musica.titulo}</Text>
                                <Text className="mt-1 text-[11px] text-[#52677F] dark:text-[#8793A7]" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                ) : (
                    <Text className="mb-3 text-xs text-[#52677F] dark:text-[#718096]">Sem sugestões por enquanto. Pesquise no catálogo abaixo.</Text>
                )}

                <View className="flex-row items-center rounded-xl border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] px-3">
                    <MagnifyingGlassIcon size={18} color="#718096" />
                    <TextInput
                        className="h-12 flex-1 px-3 text-sm text-[#142338] dark:text-white"
                        value={busca}
                        onChangeText={setBusca}
                        placeholder="Buscar música ou artista..."
                        placeholderTextColor="#718096"
                        returnKeyType="search"
                    />
                    {!!busca && <Pressable onPress={() => setBusca("")} accessibilityLabel="Limpar busca" className="p-2"><XIcon size={17} color="#8793A7" /></Pressable>}
                </View>
                {!!busca.trim() && (
                    <View className="mt-2 rounded-xl border border-[#C5D3E1] dark:border-[#263143] bg-[#F4F7FA] dark:bg-[#0D111A] p-2">
                        {carregando ? <ActivityIndicator color="#5EA7ED" /> : filtradas.slice(0, 8).map((musica) => (
                            <Pressable key={musica.id} onPress={() => selecionarMusica(musica)} className="mb-1 flex-row items-center rounded-lg p-2">
                                <Image source={musica.capa ? { uri: musica.capa } : require("../../assets/images/logo.png")} className="h-11 w-11 rounded-lg" resizeMode="cover" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm text-[#142338] dark:text-white" numberOfLines={1}>{musica.titulo}</Text>
                                    <Text className="mt-1 text-xs text-[#52677F] dark:text-[#8793A7]" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                                </View>
                                {selecionada?.id === musica.id && <CheckIcon size={18} color="#58AAF0" weight="bold" />}
                            </Pressable>
                        ))}
                        {!carregando && !filtradas.length && <Text className="p-3 text-center text-xs text-[#52677F] dark:text-[#8793A7]">Nenhuma música encontrada.</Text>}
                    </View>
                )}

                {selecionada ? (
                    <View className="mt-4 flex-row items-center rounded-xl border border-[#58AAF0]/60 bg-[#111722] p-3">
                        <Image source={selecionada.capa ? { uri: selecionada.capa } : require("../../assets/images/logo.png")} className="h-16 w-16 rounded-lg" resizeMode="cover" />
                        <View className="ml-3 flex-1">
                            <Text className="text-[10px] font-semibold uppercase tracking-wider text-[#155B91] dark:text-[#58AAF0]">Música selecionada</Text>
                            <Text className="mt-1 text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{selecionada.titulo}</Text>
                            <Text className="mt-1 text-xs text-[#52677F] dark:text-[#8793A7]" numberOfLines={1}>{selecionada.artista?.nome ?? "Artista desconhecido"}</Text>
                            <View className="mt-2 flex-row items-center">
                                <StarIcon size={13} color="#58AAF0" weight="fill" />
                                <Text className="ml-1 text-xs text-[#405570] dark:text-[#D0D0D5]">{(selecionada.nota ?? 0) > 0 ? selecionada.nota?.toFixed(1) : "Sem avaliações"}</Text>
                                <Text className="ml-1 text-xs text-[#52677F] dark:text-[#718096]">({selecionada.avaliacoes ?? 0} avaliações)</Text>
                            </View>
                        </View>
                        <Pressable onPress={() => { setSelecionada(null); setNota(0); }} accessibilityLabel="Trocar música" className="p-2">
                            <XIcon size={18} color="#8793A7" />
                        </Pressable>
                    </View>
                ) : (
                    <Text className="mt-3 text-xs text-[#52677F] dark:text-[#718096]">Selecione uma música para continuar.</Text>
                )}

                {linksOuvir.length > 0 && (
                    <View className="mt-3 flex-row flex-wrap">
                        {linksOuvir.map(({ nome, url }) => (
                            <Pressable key={nome} onPress={() => void Linking.openURL(url)} className="mb-2 mr-2 flex-row items-center rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] px-3 py-2">
                                <PlataformaMusicalIcon plataforma={nome} tamanho={18} />
                                <Text className="ml-2 text-xs text-[#142338] dark:text-white">Ouvir</Text>
                            </Pressable>
                        ))}
                    </View>
                )}

                <View className="mt-6 rounded-2xl border border-[#C5D3E1] dark:border-[#263143] bg-[#F4F7FA] dark:bg-[#0D111A] p-4">
                    <Text className="font-serif text-lg text-[#142338] dark:text-white">Sua nota</Text>
                    <View className="mt-3 flex-row items-center">
                        {[1, 2, 3, 4, 5].map((estrela) => (
                            <EstrelaNota key={estrela} estrela={estrela} nota={nota} tamanho={34} aoSelecionar={setNota} />
                        ))}
                        <Text className="ml-2 font-serif text-2xl text-[#142338] dark:text-white">{nota > 0 ? nota.toFixed(1).replace(".", ",") : "—"}<Text className="text-sm text-[#52677F] dark:text-[#718096]"> / 5</Text></Text>
                    </View>
                </View>

                <View className="mt-4 rounded-2xl border border-[#C5D3E1] dark:border-[#263143] bg-[#F4F7FA] dark:bg-[#0D111A] p-4">
                    <Text className="font-serif text-lg text-[#142338] dark:text-white">Seu comentário</Text>
                    <Text className="mt-1 text-xs leading-5 text-[#52677F] dark:text-[#8793A7]">Conte o que mais chamou sua atenção nessa música.</Text>
                    <TextInput
                        className="mt-3 min-h-[130px] rounded-xl border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] px-3 py-3 text-sm leading-5 text-[#142338] dark:text-white"
                        value={texto}
                        onChangeText={setTexto}
                        placeholder="Fale sobre a letra, o som ou o que sentiu ouvindo..."
                        placeholderTextColor="#718096"
                        multiline
                        textAlignVertical="top"
                        maxLength={500}
                        onFocus={() => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))}
                    />
                    <View className="mt-2 flex-row items-center justify-between">
                        <Text className="flex-1 text-[11px] text-[#52677F] dark:text-[#718096]">Sua avaliação aparecerá no seu perfil.</Text>
                        <Text className={"ml-2 text-xs " + (texto.length >= 480 ? "text-amber-300" : "text-[#52677F] dark:text-[#718096]")}>{texto.length}/500</Text>
                    </View>
                </View>

                {!podePublicar && <Text className="mt-4 text-center text-xs text-[#52677F] dark:text-[#8793A7]">Para publicar, escolha uma música, dê uma nota e escreva sua avaliação.</Text>}
                <Pressable
                    onPress={() => void publicar()}
                    disabled={!podePublicar || publicando}
                    className={"mt-4 h-12 flex-row items-center justify-center rounded-xl " + (podePublicar && !publicando ? "bg-[#58AAF0]" : "bg-[#263143]")}
                    style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
                >
                    {publicando ? <ActivityIndicator color="#FFFFFF" /> : <>
                        <CheckIcon size={18} color={podePublicar ? "#07111E" : "#718096"} weight="bold" />
                        <Text className={"ml-2 text-sm font-semibold " + (podePublicar ? "text-[#07111E]" : "text-[#52677F] dark:text-[#718096]")}>Publicar avaliação</Text>
                    </>}
                </Pressable>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

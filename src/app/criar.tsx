import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StarIcon } from "phosphor-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Topbar from "../components/topbar";
import { buscarMusicas } from "../services/musicaService";
import { buscarArtistasFavoritos, buscarGenerosFavoritos } from "../services/usuarioService";
import { criarPost } from "../services/postService";
import type { Musica } from "../services/musicaService";
import type { ArtistaFavorito } from "../services/usuarioService";

export default function Criar() {
    const router = useRouter();
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
    const linksOuvir: [string, string][] = selecionada ? [
        ["Spotify", selecionada.spotifyUrl ?? ""], ["Apple Music", selecionada.appleMusicUrl ?? ""],
        ["Amazon Music", selecionada.amazonMusicUrl ?? ""], ["YouTube Music", selecionada.youtubeMusicUrl ?? ""],
    ].filter((item): item is [string, string] => item[1].length > 0) : [];

    const filtradas = useMemo(() => {
        const termo = busca.trim().toLocaleLowerCase("pt-BR");
        if (!termo) return musicas;
        return musicas.filter((musica) => `${musica.titulo} ${musica.artista?.nome ?? ""}`.toLocaleLowerCase("pt-BR").includes(termo));
    }, [busca, musicas]);

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
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar titulo="Criar avaliação" subtitulo="O que você achou dessa música?" tipo="voltar" />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text className="text-white text-base font-serif mt-2 mb-3">Músicas recomendadas</Text>
                {carregando ? <Text className="text-[#718096] text-xs mb-5">Carregando recomendações...</Text> : recomendadas.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1 mb-5" contentContainerStyle={{ paddingHorizontal: 4 }}>{recomendadas.map((musica) => <Pressable key={musica.id} onPress={() => { setSelecionada(musica); setNota(0); }} className={`w-[132px] mr-3 rounded-lg border bg-[#111420] p-2 ${selecionada?.id === musica.id ? "border-[#58AAF0]" : "border-[#354052]"}`}><Image source={musica.capa ? { uri: musica.capa } : require("../../assets/images/logo.png")} className="w-full aspect-square rounded-lg" resizeMode="cover" /><Text className="text-white text-xs mt-2" numberOfLines={1}>{musica.titulo}</Text><Text className="text-[#8B93A3] text-[11px] mt-1" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text></Pressable>)}</ScrollView> : <Text className="text-[#718096] text-xs mb-5">Nenhuma recomendação para suas preferências.</Text>}
                <Text className="text-white text-base font-serif mt-2 mb-3">Escolha uma música</Text>
                <TextInput className="h-11 bg-[#111420] border border-[#354052] rounded-lg px-3 text-white text-sm mb-4" value={busca} onChangeText={setBusca} placeholder="Buscar música ou artista..." placeholderTextColor="#718096" />
                {carregando ? <ActivityIndicator color="#5EA7ED" /> : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1" contentContainerStyle={{ paddingHorizontal: 4 }}>
                        {filtradas.slice(0, 12).map((musica) => (
                            <Pressable key={musica.id} onPress={() => { setSelecionada(musica); setNota(0); setBusca(""); }} className={`w-[132px] mr-3 rounded-lg border bg-[#111420] p-2 ${selecionada?.id === musica.id ? "border-[#58AAF0]" : "border-[#354052]"}`}>
                                <Image source={musica.capa ? { uri: musica.capa } : require("../../assets/images/logo.png")} className="w-full aspect-square rounded-lg" resizeMode="cover" />
                                <Text className="text-white text-xs mt-2" numberOfLines={1}>{musica.titulo}</Text>
                                <Text className="text-[#8B93A3] text-[11px] mt-1" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                            </Pressable>
                        ))}
                        {!filtradas.length && <Text className="text-[#718096] text-sm py-4">Nenhuma música encontrada.</Text>}
                    </ScrollView>
                )}

                {selecionada && <>
                    <View className="flex-row items-center mt-5 p-3 rounded-xl border border-[#354052] bg-[#111420]">
                        <Image source={selecionada.capa ? { uri: selecionada.capa } : require("../../assets/images/logo.png")} className="w-16 h-16 rounded-lg" />
                        <View className="flex-1 ml-3"><Text className="text-white text-sm font-semibold" numberOfLines={1}>{selecionada.titulo}</Text><Text className="text-[#8B93A3] text-xs mt-1" numberOfLines={1}>{selecionada.artista?.nome ?? "Artista desconhecido"}</Text><View className="flex-row items-center mt-2"><StarIcon size={14} color="#58AAF0" weight="fill" /><Text className="text-[#D0D0D5] text-xs ml-1">{(selecionada.nota ?? 0) > 0 ? selecionada.nota?.toFixed(1) : "Sem avaliações"}</Text><Text className="text-[#718096] text-xs ml-1">({selecionada.avaliacoes ?? 0})</Text></View></View>
                    </View>
                    {linksOuvir.length > 0 && <View className="flex-row flex-wrap mt-3">{linksOuvir.map(([service, url]) => <Pressable key={service} onPress={() => void Linking.openURL(url)} className="px-3 py-2 mr-2 mb-2 rounded-lg bg-[#1C314B]"><Text className="text-white text-xs">Ouvir no {service}</Text></Pressable>)}</View>}
                    <Text className="text-white text-base font-serif mt-6">Sua nota</Text>
                    <View className="flex-row items-center mt-3">
                        {[1, 2, 3, 4, 5].map((estrela) => (
                            <View key={estrela} className="relative mr-2">
                                <StarIcon size={32} color="#52627C" weight="regular" />
                                <View className="absolute left-0 top-0 h-8 overflow-hidden" style={{ width: nota >= estrela ? 32 : nota >= estrela - 0.5 ? 16 : 0 }}><StarIcon size={32} color="#58AAF0" weight="fill" /></View>
                                {estrela > 1 && <Pressable onPress={() => setNota(estrela - 0.5)} className="absolute left-0 top-0 w-1/2 h-full" accessibilityLabel={`Nota ${estrela - 0.5}`} />}
                                <Pressable onPress={() => setNota(estrela)} className={`absolute top-0 h-full ${estrela === 1 ? "left-0 w-full" : "right-0 w-1/2"}`} accessibilityLabel={`Nota ${estrela}`} />
                            </View>
                        ))}
                        {nota > 0 && <Text className="text-[#D0D0D5] text-sm ml-2">{nota.toFixed(1).replace(".", ",")}/5</Text>}
                    </View>
                    <Text className="text-white text-base font-serif mt-6 mb-3">Seu comentário</Text>
                    <TextInput className="min-h-[120px] bg-[#111420] border border-[#354052] rounded-lg px-3 py-3 text-white text-sm" value={texto} onChangeText={setTexto} placeholder="Escreva algo sobre a música..." placeholderTextColor="#718096" multiline textAlignVertical="top" maxLength={500} />
                    <Text className="text-[#718096] text-xs text-right mt-1">{texto.length}/500</Text>
                    <Pressable onPress={() => void publicar()} disabled={publicando} className={`h-12 rounded-xl items-center justify-center mt-5 ${publicando ? "bg-[#3C6589]" : "bg-[#5EA7ED]"}`}>
                        {publicando ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-white text-base font-serif">Publicar avaliação</Text>}
                    </Pressable>
                </>}
            </ScrollView>
        </SafeAreaView>
    );
}

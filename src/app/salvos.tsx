import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { MagnifyingGlassIcon, XIcon } from "phosphor-react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import MusicCard from "../components/musicCard";
import { alternarSalvamentoMusica } from "../services/salvamentoService";
import { buscarMusicasSalvas } from "../services/usuarioService";
import type { Musica } from "../services/musicaService";

type MusicaSalva = { musica: Musica };

function normalizar(texto: string) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("pt-BR");
}

export default function Salvos() {
    const [musicas, setMusicas] = useState<MusicaSalva[]>([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [removendoId, setRemovendoId] = useState<number | null>(null);
    const [atualizando, setAtualizando] = useState(false);

    const carregarMusicasSalvas = useCallback(async () => {
        try {
            const dados = await buscarMusicasSalvas();
            setMusicas(Array.isArray(dados) ? dados : []);
            setErro("");
        } catch (erroCarregamento) {
            console.error("Erro ao buscar músicas salvas:", erroCarregamento);
            setErro("Não foi possível carregar suas músicas salvas.");
        } finally { setCarregando(false); }
    }, []);

    useEffect(() => { void carregarMusicasSalvas(); }, [carregarMusicasSalvas]);

    const musicasFiltradas = useMemo(() => {
        const consulta = normalizar(pesquisa.trim());
        if (!consulta) return musicas;

        return musicas.filter(({ musica }) =>
            [musica.titulo, musica.artista?.nome, musica.genero].some((campo) =>
                normalizar(campo ?? "").includes(consulta),
            ),
        );
    }, [musicas, pesquisa]);

    async function removerMusica(musicaId: number) {
        if (removendoId !== null) return;

        try {
            setRemovendoId(musicaId);
            await alternarSalvamentoMusica(musicaId, true);
            setMusicas((atuais) =>
                atuais.filter(({ musica }) => musica.id !== musicaId),
            );
        } catch (erroRemocao) {
            Toast.show({
                type: "error",
                text1: "Não foi possível remover a música",
                text2: erroRemocao instanceof Error ? erroRemocao.message : undefined,
            });
        } finally {
            setRemovendoId(null);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            <Topbar titulo="Músicas salvas" subtitulo="Músicas que você não quer deixar passar" />

            {carregando ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#5EA7ED" />
                </View>
            ) : erro ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-red-400 text-sm text-center">{erro}</Text>
                </View>
            ) : musicas.length === 0 ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Text className="text-[#718096] text-sm text-center">
                        Você ainda não salvou nenhuma música.
                    </Text>
                </View>
            ) : (
                <>
                    <View className="mx-4 mb-3 flex-row items-center rounded-xl border border-[#29384B] bg-[#0D1520] px-3">
                        <MagnifyingGlassIcon size={19} color="#8495A9" />
                        <TextInput
                            className="flex-1 py-3 px-3 text-sm text-white"
                            value={pesquisa}
                            onChangeText={setPesquisa}
                            placeholder="Buscar nas músicas salvas..."
                            placeholderTextColor="#738196"
                            autoCapitalize="none"
                            accessibilityLabel="Buscar nas músicas salvas"
                        />
                        {pesquisa ? (
                            <Pressable
                                onPress={() => setPesquisa("")}
                                accessibilityLabel="Limpar busca"
                            >
                                <XIcon size={18} color="#8495A9" />
                            </Pressable>
                        ) : null}
                    </View>

                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => { setAtualizando(true); void carregarMusicasSalvas().finally(() => setAtualizando(false)); }} tintColor="#58AAF0" colors={["#58AAF0"]} />}
                    >
                        {musicasFiltradas.length === 0 ? (
                            <Text className="text-[#718096] text-sm text-center py-8">
                                Nenhuma música salva corresponde à sua busca.
                            </Text>
                        ) : (
                            musicasFiltradas.map(({ musica }) => (
                                <View key={musica.id} className="mb-3">
                                    <MusicCard
                                        id={musica.id}
                                        tipo="post"
                                        titulo={musica.titulo}
                                        artista={musica.artista?.nome ?? "Artista desconhecido"}
                                        artistaId={musica.artista?.id}
                                        capa={musica.capa}
                                        nota={musica.nota}
                                        avaliacoes={musica.avaliacoes ?? musica._count?.posts}
                                        duracaoSegundos={musica.duracaoSegundos}
                                        salva
                                        salvando={removendoId === musica.id}
                                        onAlternarSalvamento={() => void removerMusica(musica.id)}
                                    />
                                </View>
                            ))
                        )}
                    </ScrollView>
                </>
            )}

            <Navbar />
        </SafeAreaView>
    );
}

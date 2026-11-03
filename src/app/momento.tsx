import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowRightIcon, BookmarkSimpleIcon } from "phosphor-react-native";
import Toast from "react-native-toast-message";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { alternarSalvamentoMusica, buscarIdsSalvos } from "../services/salvamentoService";
import { buscarFaixasDoMomento, momentosMusicais, type MomentoMusical } from "../services/momentoMusicalService";
import { feedbackSelecao } from "../services/feedbackTatil";

const capaPadrao = require("../../assets/images/logo.png");
const tamanhoPagina = 6;

export default function MusicaPorMomento() {
    const router = useRouter();
    const [catalogo, setCatalogo] = useState<Musica[]>([]);
    const [idsSalvos, setIdsSalvos] = useState<Set<number>>(new Set());
    const [momentoAtivo, setMomentoAtivo] = useState<MomentoMusical | null>(null);
    const [visiveis, setVisiveis] = useState(tamanhoPagina);
    const [carregando, setCarregando] = useState(true);
    const [salvandoId, setSalvandoId] = useState<number | null>(null);
    const [erro, setErro] = useState(false);

    useEffect(() => {
        let ativo = true;
        Promise.allSettled([buscarMusicas(), buscarIdsSalvos()]).then(([resultadoCatalogo, resultadoSalvos]) => {
            if (!ativo) return;
            if (resultadoCatalogo.status === "fulfilled") setCatalogo(resultadoCatalogo.value);
            else {
                console.error("Erro ao carregar o catálogo para Música para o seu momento:", resultadoCatalogo.reason);
                setErro(true);
            }
            if (resultadoSalvos.status === "fulfilled") setIdsSalvos(resultadoSalvos.value);
            setCarregando(false);
        });
        return () => { ativo = false; };
    }, []);

    const recomendadas = useMemo(
        () => momentoAtivo ? buscarFaixasDoMomento(catalogo, momentoAtivo) : [],
        [catalogo, momentoAtivo],
    );

    function escolherMomento(momento: MomentoMusical) {
        setMomentoAtivo(momento);
        setVisiveis(tamanhoPagina);
        feedbackSelecao();
    }

    async function alternarSalva(musica: Musica) {
        if (salvandoId !== null) return;
        const jaSalva = idsSalvos.has(musica.id);
        setSalvandoId(musica.id);
        try {
            await alternarSalvamentoMusica(musica.id, jaSalva);
            setIdsSalvos((atuais) => {
                const novos = new Set(atuais);
                if (jaSalva) novos.delete(musica.id);
                else novos.add(musica.id);
                return novos;
            });
            feedbackSelecao();
            Toast.show({ type: "success", text1: jaSalva ? "Removida das salvas" : "Música salva", text2: musica.titulo });
        } catch (erroSalvamento) {
            console.error("Erro ao salvar música recomendada:", erroSalvamento);
            Toast.show({ type: "error", text1: "Não foi possível atualizar suas músicas salvas." });
        } finally {
            setSalvandoId(null);
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#E8EEF5] dark:bg-[#080A10]">
            <Topbar tipo="voltar" titulo="Seu Momento" subtitulo="Escolha como está se sentindo" />
            <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
                <View className="mb-5 mt-1">
                    <Text className="font-serif text-2xl text-[#142338] dark:text-white">Seu Momento</Text>
                    <Text className="mt-1 text-sm leading-5 text-[#52677F] dark:text-[#9AA5B5]">Escolha um momento para ver músicas com gêneros relacionados.</Text>
                </View>

                <View className="flex-row flex-wrap justify-between">
                    {momentosMusicais.map((momento) => {
                        const ativo = momentoAtivo?.id === momento.id;
                        return (
                            <Pressable
                                key={momento.id}
                                onPress={() => escolherMomento(momento)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: ativo }}
                                style={{ width: "48%", borderColor: ativo ? momento.cor : "#252D3C" }}
                                className="mb-3 min-h-[105px] rounded-2xl border bg-white dark:bg-[#111420] p-3"
                            >
                                <Text className="text-xl">{momento.simbolo}</Text>
                                <Text className="mt-2 text-sm font-semibold text-[#142338] dark:text-white">{momento.titulo}</Text>
                                <Text className="mt-1 text-[11px] leading-4 text-[#52677F] dark:text-[#9AA5B5]" numberOfLines={2}>{momento.descricao}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                {carregando ? (
                    <View className="py-12"><ActivityIndicator color="#83C6FF" /></View>
                ) : erro ? (
                    <View className="mt-2 rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-5">
                        <Text className="text-sm leading-5 text-[#405570] dark:text-[#D0D8E4]">Não foi possível carregar as músicas. Volte para Explorar e tente novamente.</Text>
                    </View>
                ) : momentoAtivo ? (
                    <View className="mt-2">
                        <View className="mb-3 flex-row items-end justify-between">
                            <View className="flex-1">
                                <Text className="font-serif text-xl text-[#142338] dark:text-white">Para um momento {momentoAtivo.titulo.toLocaleLowerCase("pt-BR")}</Text>
                                <Text className="mt-1 text-xs text-[#52677F] dark:text-[#9AA5B5]">Sugestões baseadas nos gêneros cadastrados.</Text>
                            </View>
                            <Text className="ml-2 text-xs text-[#52677F] dark:text-[#9AA5B5]">{recomendadas.length} {recomendadas.length === 1 ? "faixa" : "faixas"}</Text>
                        </View>

                        {recomendadas.length > 0 ? (
                            <>
                                {recomendadas.slice(0, visiveis).map((musica) => {
                                    const salva = idsSalvos.has(musica.id);
                                    return (
                                        <View key={musica.id} className="mb-2 flex-row items-center rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-3">
                                            <Pressable
                                                onPress={() => router.push(`/musica/${musica.id}` as never)}
                                                className="min-w-0 flex-1 flex-row items-center"
                                            >
                                                <Image
                                                    source={musica.capa ? { uri: musica.capa } : capaPadrao}
                                                    className="h-14 w-14 rounded-xl"
                                                    resizeMode="cover"
                                                />
                                                <View className="ml-3 min-w-0 flex-1">
                                                    <Text className="text-sm font-semibold text-[#142338] dark:text-white" numberOfLines={1}>{musica.titulo}</Text>
                                                    <Text className="mt-1 text-xs text-[#52677F] dark:text-[#9AA5B5]" numberOfLines={1}>{musica.artista?.nome ?? "Artista desconhecido"}</Text>
                                                    {musica.genero ? <Text className="mt-1 text-[10px]" style={{ color: momentoAtivo.cor }} numberOfLines={1}>{musica.genero}</Text> : null}
                                                </View>
                                                <ArrowRightIcon size={16} color="#9AA5B5" />
                                            </Pressable>
                                            <Pressable
                                                onPress={() => void alternarSalva(musica)}
                                                disabled={salvandoId !== null}
                                                accessibilityRole="button"
                                                accessibilityLabel={salva ? `Remover ${musica.titulo} das salvas` : `Salvar ${musica.titulo}`}
                                                className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-[#F4F7FA] dark:bg-[#171E2B]"
                                            >
                                                {salvandoId === musica.id
                                                    ? <ActivityIndicator size="small" color={momentoAtivo.cor} />
                                                    : <BookmarkSimpleIcon size={19} color={salva ? momentoAtivo.cor : "#D0D8E4"} weight={salva ? "fill" : "regular"} />}
                                            </Pressable>
                                        </View>
                                    );
                                })}
                                {visiveis < recomendadas.length ? (
                                    <Pressable onPress={() => setVisiveis((quantidade) => quantidade + tamanhoPagina)} className="mt-2 h-11 items-center justify-center rounded-full border border-[#C5D3E1] dark:border-[#31394A]">
                                        <Text className="text-sm font-medium text-[#142338] dark:text-white">Mostrar mais músicas</Text>
                                    </Pressable>
                                ) : null}
                            </>
                        ) : (
                            <View className="rounded-2xl border border-[#D5E0EC] dark:border-[#252D3C] bg-white dark:bg-[#111420] p-5">
                                <Text className="text-sm leading-5 text-[#405570] dark:text-[#D0D8E4]">Ainda não há músicas com gêneros relacionados a esse momento no catálogo. Você pode escolher outro momento.</Text>
                            </View>
                        )}
                    </View>
                ) : null}
            </ScrollView>
            <Navbar />
        </SafeAreaView>
    );
}

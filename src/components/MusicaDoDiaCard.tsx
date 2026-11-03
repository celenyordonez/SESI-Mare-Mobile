import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowRightIcon, BookmarkSimpleIcon } from "phosphor-react-native";
import Toast from "react-native-toast-message";

import type { Musica } from "../services/musicaService";
import { alternarSalvamentoMusica, buscarIdsSalvos } from "../services/salvamentoService";
import { feedbackAcao, feedbackSelecao } from "../services/feedbackTatil";
import { corComOpacidade } from "../services/paletaCapaService";
import { usePaletaCapa } from "../hooks/usePaletaCapa";

const capaPadrao = require("../../assets/images/logo.png");

type Props = {
    musica: Musica;
};

/** Cartão compacto da música diária com acesso à música, avaliação e salvamento. */
export default function MusicaDoDiaCard({ musica }: Props) {
    const router = useRouter();
    const paleta = usePaletaCapa(musica.capa);
    const corDinamica = paleta?.dominante ?? "#58AAF0";
    const [salva, setSalva] = useState(false);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        let ativo = true;
        void buscarIdsSalvos()
            .then((ids) => {
                if (ativo) setSalva(ids.has(musica.id));
            })
            .catch((erro) => console.error("Erro ao verificar música salva:", erro));

        return () => {
            ativo = false;
        };
    }, [musica.id]);

    async function alternarSalvo() {
        if (salvando) return;
        setSalvando(true);
        feedbackAcao();

        try {
            await alternarSalvamentoMusica(musica.id, salva);
            setSalva((valor) => !valor);
        } catch (erro) {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar as músicas salvas.",
                text2: erro instanceof Error ? erro.message : undefined,
            });
        } finally {
            setSalvando(false);
        }
    }

    function abrirMusica() {
        feedbackSelecao();
        router.push(`/musica/${musica.id}` as never);
    }

    return (
        <View
            className="relative mx-5 mb-5 overflow-hidden rounded-2xl border p-3"
            style={{
                backgroundColor: "rgba(20,27,39,0.88)",
                borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.58),
                shadowColor: corDinamica,
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.24,
                shadowRadius: 20,
                elevation: 5,
            }}
        >
            <View
                pointerEvents="none"
                className="absolute -right-12 -top-12 h-32 w-32 rounded-full"
                style={{ backgroundColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.22) }}
            />
            <View
                pointerEvents="none"
                className="absolute -bottom-14 -left-10 h-28 w-28 rounded-full"
                style={{ backgroundColor: corComOpacidade(paleta?.dominante ?? "#58AAF0", 0.12) }}
            />
            <View
                pointerEvents="none"
                className="absolute left-4 right-4 top-0 h-px"
                style={{ backgroundColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.7) }}
            />
            <View className="flex-row items-center">
                <Image
                    source={musica.capa ? { uri: musica.capa } : capaPadrao}
                    className="h-[112px] w-[112px] rounded-xl bg-[#202633]"
                    resizeMode="cover"
                />
                <Pressable
                    onPress={abrirMusica}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir ${musica.titulo}`}
                    className="ml-3 flex-1 justify-center"
                    style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
                >
                    <Text className="text-base font-semibold text-[#142338] dark:text-white" numberOfLines={2}>
                        {musica.titulo}
                    </Text>
                    <Text className="mt-1 text-sm text-[#405570] dark:text-[#AAB4C5]" numberOfLines={1}>
                        {musica.artista?.nome ?? "Artista desconhecido"}
                    </Text>
                    {musica.genero ? (
                        <View
                            className="mt-2 self-start rounded-full border px-2.5 py-1"
                            style={{
                                borderColor: corComOpacidade(paleta?.acento ?? "#58AAF0", 0.35),
                                backgroundColor: corComOpacidade(paleta?.dominante ?? "#58AAF0", 0.2),
                            }}
                        >
                            <Text style={{ color: paleta?.acento ?? "#A9C8E8" }} className="text-[10px]" numberOfLines={1}>{musica.genero}</Text>
                        </View>
                    ) : null}
                </Pressable>
                <Pressable
                    onPress={() => void alternarSalvo()}
                    disabled={salvando}
                    accessibilityRole="button"
                    accessibilityLabel={salva ? "Remover música dos salvos" : "Salvar música"}
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        backgroundColor: salva ? corComOpacidade(corDinamica, 0.2) : "rgba(8,10,16,0.4)",
                    })}
                >
                    <BookmarkSimpleIcon
                        size={21}
                        color={salva ? corDinamica : "#AAB4C5"}
                        weight={salva ? "fill" : "regular"}
                    />
                </Pressable>
            </View>

            <View className="mt-3">
                <Pressable
                    onPress={abrirMusica}
                    className="h-10 flex-row items-center justify-center rounded-xl bg-[#58AAF0]"
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.82 : 1,
                        shadowColor: corDinamica,
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 3,
                    })}
                >
                    <Text className="text-sm font-semibold text-[#07111E]">Conhecer música</Text>
                    <ArrowRightIcon size={17} color="#07111E" style={{ marginLeft: 7 }} />
                </Pressable>
            </View>
        </View>
    );
}

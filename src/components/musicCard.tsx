import { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    ImageBackground,
    Share,
} from "react-native";
import { useRouter } from "expo-router";
import {
    BookmarkSimpleIcon,
    DotsThreeIcon,
    StarIcon,
    ArrowSquareOutIcon,
    ShareNetworkIcon,
} from "phosphor-react-native";
import { alternarSalvamentoMusica, buscarIdsSalvos } from "../services/salvamentoService";
import { feedbackAcao, feedbackSelecao } from "../services/feedbackTatil";
import { usePaletaCapa } from "../hooks/usePaletaCapa";
import { corComOpacidade } from "../services/paletaCapaService";
import { linkMusica } from "../services/linksCompartilhamento";
import CompartilharMusicaBotao from "./CompartilharMusicaBotao";
import { ItemMenuAcao, MenuAcoes } from "./MenuAcoes";

const logo = require("../../assets/images/logo.png");

type MusicCardProps = {
    id?: number;
    tipo: "banner" | "quadrado" | "post";
    titulo?: string;
    artista?: string;
    artistaId?: number;
    capa?: string | null;
    nota?: number;
    avaliacoes?: number;
    duracaoSegundos?: number;
    larguraFixa?: boolean;

    // Estado de salvamento controlado pela tela/serviço
    salva?: boolean;
    salvando?: boolean;
    onAlternarSalvamento?: () => void | Promise<void>;
    onRemover?: () => void;
};

function formatarDuracao(segundos: number) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${minutos}:${segundosRestantes.toString().padStart(2, "0")}`;
}

export default function MusicCard({
    id,
    tipo,
    titulo = "Nome da música",
    artista = "Nome do artista",
    artistaId,
    capa,
    nota = 0,
    avaliacoes = 0,
    duracaoSegundos = 0,
    larguraFixa = false,
    salva = false,
    salvando = false,
    onAlternarSalvamento,
    onRemover,
}: MusicCardProps) {
    const router = useRouter();
    const [menuAberto, setMenuAberto] = useState(false);
    const [salvaLocal, setSalvaLocal] = useState(salva);
    const [salvandoLocal, setSalvandoLocal] = useState(false);
    // Cards do feed usam a cor padrão; vitrines em destaque recebem a cor da capa.
    const paleta = usePaletaCapa(tipo === "post" ? null : capa);
    const corAcento = paleta?.acento ?? "#58AAF0";
    const corDominante = paleta?.dominante ?? "#58AAF0";

    useEffect(() => { setSalvaLocal(salva); }, [salva]);

    useEffect(() => {
        if (tipo !== "post" || id == null || salva) return;
        let ativo = true;
        buscarIdsSalvos()
            .then((ids) => { if (ativo) setSalvaLocal(ids.has(id)); })
            .catch((error) => console.error("Erro ao verificar música salva:", error));
        return () => { ativo = false; };
    }, [id, salva, tipo]);

    const salvamentoAtivo = salva || salvaLocal;
    const salvandoAtivo = salvando || salvandoLocal;

    const imagem = capa ? { uri: capa } : logo;

    function abrirMusica() {
        if (id) {
            feedbackSelecao();
            router.push(`/musica/${id}` as never);
        }
    }

    function abrirArtista() {
        if (artistaId != null) {
            router.push(`/artista/${artistaId}` as never);
        }
    }

    async function compartilharMusica() {
        if (!id) return;

        try {
            feedbackAcao();
            await Share.share({
                message: `Confira "${titulo}" de ${artista} na Maré:\n${linkMusica(id)}`,
            });
            setMenuAberto(false);
        } catch (error) {
            console.error("Erro ao compartilhar música:", error);
        }
    }

    async function alternarSalvamento() {
        if (id == null || salvandoAtivo) return;
        feedbackAcao();
        setSalvandoLocal(true);
        try {
            if (onAlternarSalvamento) await onAlternarSalvamento();
            else await alternarSalvamentoMusica(id, salvamentoAtivo);
            setSalvaLocal(!salvamentoAtivo);
            if (salvamentoAtivo) onRemover?.();
        } catch (error) {
            console.error("Erro ao atualizar música salva:", error);
        } finally {
            setSalvandoLocal(false);
        }
    }

    // CARD BANNER
    if (tipo === "banner") {
        return (
            <Pressable
                onPress={abrirMusica}
                style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                    borderColor: corComOpacidade(corAcento, 0.52),
                    shadowColor: corDominante,
                    shadowOpacity: paleta ? 0.28 : 0,
                    shadowRadius: 14,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: paleta ? 4 : 0,
                })}
                className="w-[240px] h-[120px] mr-3 overflow-hidden rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420]"
            >
                <ImageBackground
                    source={imagem}
                    className="flex-1 justify-end"
                    resizeMode="cover"
                >
                    <View className="flex-1 justify-end bg-black/60 p-3">
                        <Text
                            className="text-[#142338] dark:text-white text-lg"
                            numberOfLines={1}
                        >
                            {titulo}
                        </Text>

                        <Text
                            className="text-[#405570] dark:text-[#D0D0D5] text-xs mt-1"
                            numberOfLines={1}
                        >
                            {artista}
                        </Text>

                        <View className="flex-row items-center mt-2">
                            {avaliacoes > 0 ? (
                                <>
                                    <StarIcon
                                        size={13}
                                        color="#58AAF0"
                                        weight="fill"
                                    />
                                    <Text className="text-[#142338] dark:text-white text-[11px] ml-1">
                                        {Number(nota).toFixed(1)}
                                    </Text>
                                    <Text className="text-[#B5BBCA] text-[11px] ml-1">
                                        ({avaliacoes})
                                    </Text>
                                </>
                            ) : (
                                <Text className="text-[#B5BBCA] text-[11px]">
                                    Sem avaliações
                                </Text>
                            )}

                            <Text className="text-[#405570] dark:text-[#D0D0D5] text-[11px] ml-3">
                                {formatarDuracao(duracaoSegundos)}
                            </Text>
                        </View>
                    </View>
                    {id != null ? (
                        <CompartilharMusicaBotao
                            musicaId={id}
                            titulo={titulo}
                            artista={artista}
                            classeBotao="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full bg-black/60"
                        />
                    ) : null}
                </ImageBackground>
            </Pressable>
        );
    }

    // CARD QUADRADO
    if (tipo === "quadrado") {
        return (
            <Pressable
                onPress={abrirMusica}
                style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.985 : 1 }],
                    borderColor: corComOpacidade(corAcento, 0.52),
                    shadowColor: corDominante,
                    shadowOpacity: paleta ? 0.28 : 0,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: paleta ? 3 : 0,
                })}
                className={`rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] p-2 ${
                    larguraFixa
                        ? "w-[128px] mr-3"
                        : "w-full max-w-[128px] mx-auto"
                }`}
            >
                <View className="relative">
                    <Image
                        source={imagem}
                        className="w-full aspect-square rounded-xl"
                        resizeMode="cover"
                    />
                    {id != null ? (
                        <CompartilharMusicaBotao
                            musicaId={id}
                            titulo={titulo}
                            artista={artista}
                            classeBotao="absolute right-1.5 top-1.5 h-8 w-8 items-center justify-center rounded-full bg-black/65"
                        />
                    ) : null}
                </View>

                <Text
                    className="text-[#142338] dark:text-white text-xs mt-2"
                    numberOfLines={1}
                >
                    {titulo}
                </Text>

                <Text
                    className="text-[#8B93A3] text-[11px] mt-1"
                    numberOfLines={1}
                >
                    {artista}
                </Text>

                <View className="flex-row items-center mt-1">
                    {avaliacoes > 0 ? (
                        <>
                            <StarIcon
                                size={12}
                                color="#58AAF0"
                                weight="fill"
                            />
                            <Text className="text-[#405570] dark:text-[#D0D0D5] text-[10px] ml-1">
                                {Number(nota).toFixed(1)}
                            </Text>
                        </>
                    ) : (
                        <Text className="text-[#687386] text-[10px]">
                            Sem avaliações
                        </Text>
                    )}
                </View>
            </Pressable>
        );
    }

    // CARD POST / SALVO
    return (
        <>
            <Pressable
                onPress={abrirMusica}
                style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.99 : 1 }] })}
                className="w-full rounded-lg border border-[#C5D3E1] dark:border-[#354052] bg-white dark:bg-[#111420] p-3"
            >
                <View className="flex-row items-center">
                    <Image
                        source={imagem}
                        className="w-16 h-16 rounded-xl"
                        resizeMode="cover"
                    />

                    <View className="flex-1 min-w-0 ml-3">
                        <Text
                            className="text-[#142338] dark:text-white text-sm"
                            numberOfLines={1}
                        >
                            {titulo}
                        </Text>

                        <Text
                            className="text-[#8B93A3] text-xs mt-1"
                            numberOfLines={1}
                        >
                            {artista}
                        </Text>

                        <View className="flex-row items-center mt-2">
                            {avaliacoes > 0 ? (
                                <>
                                    <StarIcon size={13} color="#58AAF0" weight="fill" />
                                    <Text className="text-[#142338] dark:text-white text-[11px] ml-1">
                                        {Number(nota).toFixed(1)}
                                    </Text>
                                    <Text
                                        className="text-[#687386] text-[11px] ml-1"
                                        numberOfLines={1}
                                    >
                                        ({avaliacoes}{" "}
                                        {avaliacoes === 1 ? "avaliação" : "avaliações"})
                                    </Text>
                                </>
                            ) : (
                                <Text className="text-[#687386] text-[11px]">
                                    Sem avaliações
                                </Text>
                            )}
                        </View>
                    </View>

                    <Text className="text-[#687386] text-[11px] ml-2">
                        {formatarDuracao(duracaoSegundos)}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#C5D3E1] dark:border-[#354052]">
                    <Pressable
                        onPress={(event) => {
                            event.stopPropagation();
                            void alternarSalvamento();
                        }}
                        disabled={salvandoAtivo}
                        className="flex-row items-center"
                    >
                        <BookmarkSimpleIcon
                            size={17}
                            color={salvamentoAtivo ? "#58AAF0" : "#687386"}
                            weight={salvamentoAtivo ? "fill" : "regular"}
                        />
                        <Text
                            className={`text-[11px] ml-1 ${
                                salvamentoAtivo ? "text-[#155B91] dark:text-[#58AAF0]" : "text-[#687386]"
                            }`}
                        >
                            {salvandoAtivo ? "Salvando..." : salvamentoAtivo ? "Salva" : "Salvar"}
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={(event) => {
                            event.stopPropagation();
                            setMenuAberto(true);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Opções da música"
                        className="h-9 w-9 items-center justify-center rounded-full border border-[#D5E0EC] bg-[#F4F7FA] dark:border-[#293143] dark:bg-[#171E2B]"
                    >
                        <DotsThreeIcon size={22} color="#8793A7" weight="bold" />
                    </Pressable>
                </View>
            </Pressable>
            <MenuAcoes aberto={menuAberto} titulo="Opções da música" aoFechar={() => setMenuAberto(false)}>
                <ItemMenuAcao
                    titulo="Abrir música"
                    descricao={titulo}
                    icone={<ArrowSquareOutIcon size={19} color="#58AAF0" />}
                    aoPressionar={() => { setMenuAberto(false); abrirMusica(); }}
                />
                {artistaId != null ? (
                    <ItemMenuAcao
                        titulo="Ver artista"
                        descricao={artista}
                        icone={<ArrowSquareOutIcon size={19} color="#58AAF0" />}
                        aoPressionar={() => { setMenuAberto(false); abrirArtista(); }}
                    />
                ) : null}
                <ItemMenuAcao
                    titulo="Compartilhar música"
                    descricao="Enviar por outro aplicativo"
                    icone={<ShareNetworkIcon size={19} color="#58AAF0" />}
                    aoPressionar={() => void compartilharMusica()}
                />
            </MenuAcoes>
        </>
    );
}

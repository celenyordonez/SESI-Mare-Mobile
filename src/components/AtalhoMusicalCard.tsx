import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { usePaletaCapa } from "../hooks/usePaletaCapa";
import { corComOpacidade } from "../services/paletaCapaService";
import {
    ArrowRightIcon,
    ArrowsLeftRightIcon,
    ChartBarIcon,
    DiceFiveIcon,
    GridFourIcon,
    HeartIcon,
    MusicNotesIcon,
} from "phosphor-react-native";

type Props = {
    tipo: "descoberta" | "universo" | "roleta" | "duelo" | "momento" | "bingo";
    imagem?: string | null;
};

/** Atalho em formato de vitrine horizontal para as funções musicais da Maré. */
export default function AtalhoMusicalCard({ tipo, imagem }: Props) {
    const router = useRouter();
    const paleta = usePaletaCapa(imagem);
    const descoberta = tipo === "descoberta";
    const universo = tipo === "universo";
    const roleta = tipo === "roleta";
    const duelo = tipo === "duelo";
    const momento = tipo === "momento";
    const cor = descoberta
        ? "#8CC8FF"
        : universo
            ? "#83D9C9"
            : roleta
                ? "#F5C879"
                : duelo
                    ? "#B9A1FF"
                    : momento
                        ? "#FF9A8B"
                        : "#FFB77A";
    const coresSobreposicao: [string, string, ...string[]] = descoberta
        ? ["rgba(5,12,22,0.12)", "rgba(7,12,20,0.48)", "rgba(7,12,20,0.94)"]
        : universo
            ? ["rgba(5,15,15,0.14)", "rgba(5,14,14,0.48)", "rgba(5,14,14,0.94)"]
            : duelo
                ? ["rgba(15,10,25,0.12)", "rgba(15,10,25,0.5)", "rgba(10,9,16,0.95)"]
                : momento
                    ? ["rgba(25,9,11,0.12)", "rgba(25,9,11,0.5)", "rgba(13,9,12,0.95)"]
                    : ["rgba(23,15,5,0.1)", "rgba(23,17,8,0.5)", "rgba(13,12,12,0.95)"];

    const configuracoes = {
        descoberta: { titulo: "Descoberta", descricao: "Músicas novas, do seu jeito", selo: "PARA DESCOBRIR", rota: "/descoberta" },
        universo: { titulo: "Minha Maré", descricao: "O retrato do seu gosto musical", selo: "SUA MARÉ", rota: "/universo" },
        roleta: { titulo: "Roleta musical", descricao: "Deixe o acaso escolher uma faixa", selo: "SURPRESA MUSICAL", rota: "/roleta" },
        duelo: { titulo: "Duelo musical", descricao: "Escolha a sua favorita", selo: "CARA A CARA", rota: "/duelo" },
        momento: { titulo: "Seu Momento", descricao: "O que combina com você agora?", selo: "PELO SEU MOMENTO", rota: "/momento" },
        bingo: { titulo: "Bingo musical", descricao: "Complete sua cartela ouvindo música", selo: "DESAFIOS MUSICAIS", rota: "/bingo" },
    } as const;
    const { titulo, descricao, selo, rota } = configuracoes[tipo];

    return (
        <Pressable
            onPress={() => router.push(rota as never)}
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${titulo}`}
            className="relative mr-3 h-[184px] w-[274px] overflow-hidden rounded-2xl border"
            style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderColor: corComOpacidade(paleta?.acento ?? cor, 0.72),
                borderWidth: 1.5,
                shadowColor: paleta?.dominante ?? cor,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.36,
                shadowRadius: 21,
                elevation: 7,
            })}
        >
            {imagem ? (
                <Image
                    source={{ uri: imagem }}
                    resizeMode="cover"
                    style={[StyleSheet.absoluteFill, { opacity: 0.84 }]}
                />
            ) : null}
            <LinearGradient
                pointerEvents="none"
                colors={coresSobreposicao}
                locations={[0, 0.48, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            {paleta ? (
                <View
                    pointerEvents="none"
                    className="absolute left-5 right-5 top-0 h-[2px]"
                    style={{ backgroundColor: corComOpacidade(paleta.acento, 0.82) }}
                />
            ) : null}
            <View className="flex-1 justify-between p-4">
                <View className="flex-row items-start justify-between">
                    <View
                        className="flex-row items-center rounded-full border px-2.5 py-1.5"
                        style={{
                            backgroundColor: "rgba(8,10,16,0.52)",
                            borderColor: descoberta ? "rgba(140,200,255,0.34)" : universo ? "rgba(131,217,201,0.34)" : "rgba(245,200,121,0.36)",
                        }}
                    >
                        {descoberta
                            ? <MusicNotesIcon size={14} color={cor} weight="fill" />
                            : universo
                                ? <ChartBarIcon size={14} color={cor} weight="fill" />
                                : roleta
                                    ? <DiceFiveIcon size={14} color={cor} weight="fill" />
                                    : duelo
                                        ? <ArrowsLeftRightIcon size={14} color={cor} weight="bold" />
                                        : momento
                                            ? <HeartIcon size={14} color={cor} weight="fill" />
                                            : <GridFourIcon size={14} color={cor} weight="fill" />}
                        <Text style={{ color: cor }} className="ml-1.5 text-[9px] font-bold tracking-[1.1px]">
                            {selo}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-end justify-between">
                    <View className="mr-3 flex-1">
                        <Text style={momento ? { fontSize: 18, lineHeight: 24 } : undefined} className="font-serif text-[22px] leading-7 text-[#142338] dark:text-white" numberOfLines={1}>
                            {titulo}
                        </Text>
                        <Text className="mt-1 text-xs leading-4 text-[#405570] dark:text-[#D0D8E4]" numberOfLines={1}>
                            {descricao}
                        </Text>
                    </View>
                    <View
                        className="h-10 w-10 items-center justify-center rounded-full"
                        style={{ backgroundColor: cor }}
                    >
                        <ArrowRightIcon size={19} color="#08111B" weight="bold" />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

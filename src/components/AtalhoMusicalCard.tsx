import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRightIcon, ChartBarIcon, MusicNotesIcon } from "phosphor-react-native";

type Props = {
    tipo: "descoberta" | "universo";
    imagem?: string | null;
};

/** Atalho em formato de vitrine horizontal para as funções musicais da Maré. */
export default function AtalhoMusicalCard({ tipo, imagem }: Props) {
    const router = useRouter();
    const descoberta = tipo === "descoberta";
    const cor = descoberta ? "#8CC8FF" : "#83D9C9";
    const coresSobreposicao: [string, string, ...string[]] = descoberta
        ? ["rgba(5,12,22,0.12)", "rgba(7,12,20,0.48)", "rgba(7,12,20,0.94)"]
        : ["rgba(5,15,15,0.14)", "rgba(5,14,14,0.48)", "rgba(5,14,14,0.94)"];

    return (
        <Pressable
            onPress={() => router.push((descoberta ? "/descoberta" : "/universo") as never)}
            accessibilityRole="button"
            accessibilityLabel={descoberta ? "Abrir Descoberta" : "Abrir Meu Universo Musical"}
            className="relative mr-3 h-[184px] w-[274px] overflow-hidden rounded-2xl border"
            style={({ pressed }) => ({
                opacity: pressed ? 0.9 : 1,
                borderColor: descoberta ? "rgba(140,200,255,0.72)" : "rgba(131,217,201,0.72)",
                borderWidth: 1.5,
                shadowColor: cor,
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
            <View className="flex-1 justify-between p-4">
                <View className="flex-row items-start justify-between">
                    <View
                        className="flex-row items-center rounded-full border px-2.5 py-1.5"
                        style={{
                            backgroundColor: "rgba(8,10,16,0.52)",
                            borderColor: descoberta ? "rgba(140,200,255,0.34)" : "rgba(131,217,201,0.34)",
                        }}
                    >
                        {descoberta
                            ? <MusicNotesIcon size={14} color={cor} weight="fill" />
                            : <ChartBarIcon size={14} color={cor} weight="fill" />}
                        <Text style={{ color: cor }} className="ml-1.5 text-[9px] font-bold tracking-[1.1px]">
                            {descoberta ? "PARA DESCOBRIR" : "SEU UNIVERSO"}
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-end justify-between">
                    <View className="mr-3 flex-1">
                        <Text className="font-serif text-[22px] leading-7 text-white" numberOfLines={1}>
                            {descoberta ? "Descoberta" : "Meu universo"}
                        </Text>
                        <Text className="mt-1 text-xs leading-4 text-[#D0D8E4]" numberOfLines={1}>
                            {descoberta ? "Músicas novas, do seu jeito" : "O retrato do seu gosto musical"}
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

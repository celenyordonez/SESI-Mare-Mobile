import { View, Text, Image, Pressable, ImageBackground } from "react-native";

import {
    PlayIcon,
    BookmarkSimpleIcon,
    DotsThreeIcon,
    StarIcon,
} from "phosphor-react-native";

type MusicCardProps = {
    tipo: "banner" | "quadrado" | "post";
};

export default function MusicCard({ tipo }: MusicCardProps) {

    // =========================
    // CARD BANNER
    // =========================

    if (tipo === "banner") {
        return (
            <View className="w-[320px] h-[160px] rounded-xl overflow-hidden mr-4 border-2 border-[#171E2B]">

                <ImageBackground
                    source={require("../../assets/images/logo.png")}
                    className="flex-1"
                    resizeMode="cover"
                >

                    {/* Camada escura por cima da imagem */}
                    <View className="flex-1 bg-black/45 p-4 justify-between">

                        {/* Botão play */}
                        <View className="items-end">
                            <Pressable className="w-10 h-10 rounded-full bg-[#58AAF0] items-center justify-center">

                                <PlayIcon
                                    size={18}
                                    color="#FFFFFF"
                                    weight="fill"
                                />

                            </Pressable>
                        </View>

                        {/* Informações */}
                        <View>

                            <Text
                                className="text-white text-lg font-serif"
                                numberOfLines={1}
                            >
                                Nome da música
                            </Text>

                            <Text
                                className="text-[#D0D0D5] text-xs font-serif mt-1"
                                numberOfLines={1}
                            >
                                Nome do artista
                            </Text>

                            <View className="flex-row items-center mt-2">

                                <StarIcon
                                    size={13}
                                    color="#58AAF0"
                                    weight="fill"
                                />

                                <Text className="text-white text-[11px] ml-1">
                                    4,8
                                </Text>

                                <Text className="text-[#D0D0D5] text-[11px] ml-1">
                                    (124 avaliações)
                                </Text>

                                <Text className="text-[#D0D0D5] text-[11px] ml-3">
                                    3:42
                                </Text>

                            </View>

                        </View>

                    </View>

                </ImageBackground>

            </View>
        );
    }


    // =========================
    // CARD QUADRADO
    // =========================

    if (tipo === "quadrado") {
        return (
            <View className="w-[120px] mr-4 border-2 border-[#171E2B] rounded-xl p-2">

                <Image
                    source={require("../../assets/images/logo.png")}
                    className="w-[100px] h-[100px] rounded-xl"
                    resizeMode="cover"
                />

                <Text
                    className="text-white text-xs font-serif mt-2"
                    numberOfLines={1}
                >
                    Nome da música
                </Text>

                <Text
                    className="text-[#8B93A3] text-[11px] font-serif mt-1"
                    numberOfLines={1}
                >
                    Nome do artista
                </Text>

                <View className="flex-row items-center mt-1">

                    <StarIcon
                        size={12}
                        color="#58AAF0"
                        weight="fill"
                    />

                    <Text className="text-[#D0D0D5] text-[10px] ml-1">
                        4,8
                    </Text>

                </View>

            </View>
        );
    }


    // =========================
    // CARD POST / SALVO
    // =========================

    return (
        <View className="bg-[#111420] rounded-2xl p-3 mx-8">

            {/* Parte principal */}
            <View className="flex-row items-center">

                {/* Capa */}
                <Image
                    source={require("../../assets/images/logo.png")}
                    className="w-16 h-16 rounded-xl"
                    resizeMode="cover"
                />

                {/* Informações */}
                <View className="flex-1 ml-3">

                    <Text
                        className="text-white text-sm font-serif"
                        numberOfLines={1}
                    >
                        Nome da música
                    </Text>

                    <Text
                        className="text-[#8B93A3] text-xs font-serif mt-1"
                        numberOfLines={1}
                    >
                        Nome do artista
                    </Text>

                    {/* Avaliação geral da música */}
                    <View className="flex-row items-center mt-2">

                        <StarIcon
                            size={13}
                            color="#58AAF0"
                            weight="fill"
                        />

                        <Text className="text-[#D0D0D5] text-[11px] ml-1">
                            4,8
                        </Text>

                        <Text className="text-[#687386] text-[11px] ml-1">
                            (124 avaliações)
                        </Text>

                    </View>

                </View>

                {/* Duração + play */}
                <View className="flex-row items-center">

                    <Text className="text-[#687386] text-[11px] font-serif mr-2">
                        3:42
                    </Text>

                    <Pressable className="w-9 h-9 rounded-full bg-[#58AAF0] items-center justify-center">

                        <PlayIcon
                            size={17}
                            color="#FFFFFF"
                            weight="fill"
                        />

                    </Pressable>

                </View>

            </View>

            {/* Parte inferior */}
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-[#171E2B]">

                {/* Salva */}
                <View className="flex-row items-center">

                    <BookmarkSimpleIcon
                        size={17}
                        color="#58AAF0"
                        weight="fill"
                    />

                    <Text className="text-[#58AAF0] text-[11px] font-serif ml-1">
                        Salva
                    </Text>

                </View>

                {/* Mais opções */}
                <Pressable>

                    <DotsThreeIcon
                        size={20}
                        color="#D0D0D5"
                    />

                </Pressable>

            </View>

        </View>
    );
}
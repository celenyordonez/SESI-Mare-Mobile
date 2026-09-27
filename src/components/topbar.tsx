import { View, Text, Pressable } from "react-native";
import { usePathname, useRouter } from "expo-router";

import {
    UserIcon,
    ArrowLeftIcon,
    CaretLeftIcon,
} from "phosphor-react-native";

interface TopBarProps {
    titulo: string;
    subtitulo?: string;
    tipo?: "normal" | "voltar";
}

export default function TopBar({
    titulo,
    subtitulo,
    tipo = "normal",
}: TopBarProps) {

    const router = useRouter();
    const pathname = usePathname();

    return (
        <View className="px-8 pt-6">

            <View className="flex-row items-center">

                {/* Botão voltar */}
                {tipo === "voltar" && (
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-3"
                    >
                        <CaretLeftIcon
                            size={24}
                            color="#D0D0D5"
                        />
                    </Pressable>
                )}


                {/* Título */}
                <View className="flex-1">

                    <Text className="text-white text-lg font-serif">
                        {titulo}
                    </Text>

                    <Text className="text-[#6B7280] text-xs font-serif mt-1">
                        {subtitulo}
                    </Text>

                </View>


                {/* Perfil */}
                {tipo === "normal" && (
                    <Pressable
                        onPress={() => router.push("/perfil")}
                    >
                        <UserIcon
                            size={24}
                            color={
                                pathname === "/perfil"
                                    ? "#58AAF0"
                                    : "#D0D0D5"
                            }
                            weight={
                                pathname === "/perfil"
                                    ? "fill"
                                    : "regular"
                            }
                        />
                    </Pressable>
                )}

            </View>

        </View>
    );
}
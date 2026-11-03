import { View, Pressable, Image, Text } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useContadoresNavegacao } from "./ContadoresNavegacao";

import {
    GearIcon,
    BellIcon,
    CaretLeftIcon,
} from "phosphor-react-native";

interface TopBarProps {
    titulo?: string;
    subtitulo?: string;
    tipo?: "normal" | "voltar" | "simples";
}

export default function TopBar({ tipo = "normal" }: TopBarProps) {

    const router = useRouter();
    const pathname = usePathname();
    const { colorScheme } = useColorScheme();
    const corIconeInativa = colorScheme === "dark" ? "#D0D0D5" : "#405570";
    const { notificacoesNaoLidas } = useContadoresNavegacao();

    return (
        <View className="px-8 pt-6 pb-4">

            <View className="flex-row items-center">
                {tipo === "normal" ? (
                    <>
                        {/* Lados simétricos para manter a logo centralizada. */}
                        <Pressable
                            onPress={() => router.push("/configuracoes")}
                            accessibilityLabel="Abrir configurações"
                            className="h-10 w-10 items-center justify-center"
                        >
                            <GearIcon
                                size={22}
                                color={pathname === "/configuracoes" ? "#58AAF0" : corIconeInativa}
                                weight={pathname === "/configuracoes" ? "fill" : "regular"}
                            />
                        </Pressable>

                        <Pressable
                            onPress={() => router.replace("/")}
                            accessibilityLabel="Ir para a página inicial"
                            className="flex-1 items-center px-2"
                        >
                            <Image
                                source={require("../../assets/images/logo.png")}
                                className="w-[104px] h-[46px]"
                                resizeMode="contain"
                                accessible={false}
                            />
                        </Pressable>

                        <Pressable
                            onPress={() => router.push("/notificacoes")}
                            accessibilityLabel={`Abrir notificações${notificacoesNaoLidas ? `, ${notificacoesNaoLidas} não lidas` : ""}`}
                            className="h-10 w-10 items-center justify-center"
                        >
                            <BellIcon
                                size={24}
                                color={pathname === "/notificacoes" ? "#58AAF0" : corIconeInativa}
                                weight={pathname === "/notificacoes" ? "fill" : "regular"}
                            />
                            {notificacoesNaoLidas > 0 ? (
                                <View className="absolute right-0 top-0 min-w-[17px] items-center rounded-full border border-white dark:border-[#111420] bg-[#58AAF0] px-1">
                                    <Text className="text-[9px] font-bold text-[#07111C]">
                                        {notificacoesNaoLidas > 99 ? "99+" : notificacoesNaoLidas}
                                    </Text>
                                </View>
                            ) : null}
                        </Pressable>
                    </>
                ) : tipo === "voltar" ? (
                    <>
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <CaretLeftIcon size={24} color={corIconeInativa} />
                        </Pressable>
                        <Pressable
                            onPress={() => router.replace("/")}
                            accessibilityLabel="Ir para a página inicial"
                            className="flex-1 items-center px-2"
                        >
                            <Image
                                source={require("../../assets/images/logo.png")}
                                className="w-[104px] h-[46px]"
                                resizeMode="contain"
                                accessible={false}
                            />
                        </Pressable>
                        <View className="w-10 h-10" />
                    </>
                ) : (
                    <Pressable
                        onPress={() => router.replace("/")}
                        accessibilityLabel="Ir para a página inicial"
                        className="flex-1 items-center"
                    >
                        <Image
                            source={require("../../assets/images/logo.png")}
                            className="w-[104px] h-[46px]"
                            resizeMode="contain"
                            accessible={false}
                        />
                    </Pressable>
                )}
            </View>

        </View>
    );
}

import { View, Text, Pressable } from "react-native";

import {
    HouseLineIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    BookmarkSimpleIcon,
    BellIcon,
} from "phosphor-react-native";

import { usePathname, useRouter } from "expo-router";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();

    return (
        <View className="h-[75px] bg-[#111420] border-t border-[#171E2B] flex-row">

            {/* Início */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/")}
            >
                <HouseLineIcon
                    size={24}
                    color={pathname === "/" ? "#58AAF0" : "#D0D0D5"}
                    weight={pathname === "/" ? "fill" : "regular"}
                />

                <Text
                    className={`text-xs mt-1 ${pathname === "/" ? "text-[#58AAF0]" : "text-[#D0D0D5]"
                        }`}
                >
                    Início
                </Text>
            </Pressable>


            {/* Explorar */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/explorar")}
            >
                <MagnifyingGlassIcon
                    size={24}
                    color={pathname === "/explorar" ? "#58AAF0" : "#D0D0D5"}
                />

                <Text
                    className={`text-xs mt-1 ${pathname === "/explorar"
                            ? "text-[#58AAF0]"
                            : "text-[#D0D0D5]"
                        }`}
                >
                    Explorar
                </Text>
            </Pressable>


            {/* Criar */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/criar")}
            >
                <View className="w-12 h-12 rounded-full bg-[#58AAF0] items-center justify-center">

                    <PlusIcon
                        size={28}
                        color="#FFFFFF"
                    />

                </View>
            </Pressable>

            {/* Notificações */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/notificacoes")}
            >
                <BellIcon
                    size={24}
                    color={pathname === "/notificacoes" ? "#58AAF0" : "#D0D0D5"}
                    weight={pathname === "/notificacoes" ? "fill" : "regular"}
                />

                <Text
                    className={`text-xs mt-1 ${pathname === "/notificacoes"
                            ? "text-[#58AAF0]"
                            : "text-[#D0D0D5]"
                        }`}
                >
                    Notificações
                </Text>
            </Pressable>

            {/* Salvos */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/salvos")}
            >
                <BookmarkSimpleIcon
                    size={24}
                    color={pathname === "/salvos" ? "#58AAF0" : "#D0D0D5"}
                    weight={pathname === "/salvos" ? "fill" : "regular"}
                />

                <Text
                    className={`text-xs mt-1 ${pathname === "/salvos"
                            ? "text-[#58AAF0]"
                            : "text-[#D0D0D5]"
                        }`}
                >
                    Salvos
                </Text>
            </Pressable>

        </View>
    );
}
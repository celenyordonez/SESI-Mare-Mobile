import { useEffect, useState } from "react";
import { DeviceEventEmitter, Image, View, Text, Pressable } from "react-native";

import {
    HouseLineIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    ChatCircleIcon,
    UserIcon,
} from "phosphor-react-native";

import { usePathname, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { buscarFotoPerfil } from "../services/perfilCache";
import { useContadoresNavegacao } from "./ContadoresNavegacao";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();
    const { colorScheme } = useColorScheme();
    const corIconeInativa = colorScheme === "dark" ? "#D0D0D5" : "#405570";
    const corDestaque = colorScheme === "dark" ? "#58AAF0" : "#155B91";
    const inicioAtivo = pathname === "/" || pathname === "/home";
    const perfilAtivo = pathname === "/perfil";
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
    const { mensagensNaoLidas } = useContadoresNavegacao();

    useEffect(() => {
        let ativo = true;
        const carregarFoto = () => {
            void buscarFotoPerfil()
                .then((imagem) => { if (ativo) setFotoPerfil(imagem); })
                .catch((erro) => console.error("Erro ao carregar a foto do perfil na navegação:", erro));
        };

        carregarFoto();
        const ouvinte = DeviceEventEmitter.addListener("usuarioAtualizado", carregarFoto);
        return () => {
            ativo = false;
            ouvinte.remove();
        };
    }, []);

    return (
        <View className="h-[75px] bg-white dark:bg-[#111420] border-t border-[#D5E0EC] dark:border-[#171E2B] flex-row">

            {/* Início */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/")}
            >
                <HouseLineIcon
                    size={24}
                    color={inicioAtivo ? corDestaque : corIconeInativa}
                    weight={inicioAtivo ? "fill" : "regular"}
                />

                <Text
                    className={`text-xs mt-1 ${inicioAtivo
                        ? (colorScheme === "dark" ? "text-[#155B91] dark:text-[#58AAF0]" : "text-[#155B91]")
                        : "text-[#405570] dark:text-[#D0D0D5]"
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
                    color={pathname === "/explorar" ? corDestaque : corIconeInativa}
                />

                <Text
                    className={`text-xs mt-1 ${pathname === "/explorar"
                        ? (colorScheme === "dark" ? "text-[#155B91] dark:text-[#58AAF0]" : "text-[#155B91]")
                        : "text-[#405570] dark:text-[#D0D0D5]"
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

            {/* Conversas: a coleção salva é acessada pela aba do perfil. */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/mensagens" as never)}
                accessibilityRole="button"
                accessibilityLabel="Abrir conversas"
            >
                <View>
                    <ChatCircleIcon
                        size={24}
                        color={pathname.startsWith("/mensagens") ? "#58AAF0" : "#D0D0D5"}
                        weight={pathname.startsWith("/mensagens") ? "fill" : "regular"}
                    />
                    {mensagensNaoLidas > 0 ? (
                        <View className="absolute -right-2 -top-2 min-w-[17px] items-center rounded-full border border-white dark:border-[#111420] bg-[#58AAF0] px-1">
                            <Text className="text-[9px] font-bold text-[#07111C]">
                                {mensagensNaoLidas > 99 ? "99+" : mensagensNaoLidas}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <Text
                    className={`text-xs mt-1 ${pathname.startsWith("/mensagens")
                            ? "text-[#155B91] dark:text-[#58AAF0]"
                            : "text-[#405570] dark:text-[#D0D0D5]"
                        }`}
                >
                    Conversas
                </Text>
            </Pressable>

            {/* Perfil: exibe a foto quando disponível. */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/perfil")}
                accessibilityRole="button"
                accessibilityLabel="Abrir meu perfil"
            >
                {fotoPerfil ? (
                    <Image
                        source={{ uri: fotoPerfil }}
                        className={`h-8 w-8 rounded-full border ${perfilAtivo ? "border-[#58AAF0]" : "border-[#C5D3E1] dark:border-[#354052]"}`}
                    />
                ) : (
                    <UserIcon
                        size={24}
                        color={perfilAtivo ? "#58AAF0" : "#D0D0D5"}
                        weight={perfilAtivo ? "fill" : "regular"}
                    />
                )}

                <Text
                    className={`text-xs mt-1 ${perfilAtivo
                            ? "text-[#155B91] dark:text-[#58AAF0]"
                            : "text-[#405570] dark:text-[#D0D0D5]"
                        }`}
                >
                    Perfil
                </Text>
            </Pressable>

        </View>
    );
}

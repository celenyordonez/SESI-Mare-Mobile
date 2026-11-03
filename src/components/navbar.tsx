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
import { buscarFotoPerfil } from "../services/perfilCache";

export default function Navbar() {

    const router = useRouter();
    const pathname = usePathname();
    const inicioAtivo = pathname === "/" || pathname === "/home";
    const perfilAtivo = pathname === "/perfil";
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

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
        <View className="h-[75px] bg-[#111420] border-t border-[#171E2B] flex-row">

            {/* Início */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/")}
            >
                <HouseLineIcon
                    size={24}
                    color={inicioAtivo ? "#58AAF0" : "#D0D0D5"}
                    weight={inicioAtivo ? "fill" : "regular"}
                />

                <Text
                    className={`text-xs mt-1 ${inicioAtivo ? "text-[#58AAF0]" : "text-[#D0D0D5]"
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

            {/* Conversas: a coleção salva é acessada pela aba do perfil. */}
            <Pressable
                className="flex-1 items-center justify-center"
                onPress={() => router.push("/mensagens" as never)}
                accessibilityRole="button"
                accessibilityLabel="Abrir conversas"
            >
                <ChatCircleIcon
                    size={24}
                    color={pathname.startsWith("/mensagens") ? "#58AAF0" : "#D0D0D5"}
                    weight={pathname.startsWith("/mensagens") ? "fill" : "regular"}
                />

                <Text
                    className={`text-xs mt-1 ${pathname.startsWith("/mensagens")
                            ? "text-[#58AAF0]"
                            : "text-[#D0D0D5]"
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
                        className={`h-8 w-8 rounded-full border ${perfilAtivo ? "border-[#58AAF0]" : "border-[#354052]"}`}
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
                            ? "text-[#58AAF0]"
                            : "text-[#D0D0D5]"
                        }`}
                >
                    Perfil
                </Text>
            </Pressable>

        </View>
    );
}

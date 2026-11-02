import { useEffect, useState } from "react";
import { DeviceEventEmitter, View, Pressable, Image } from "react-native";
import { usePathname, useRouter } from "expo-router";

import {
    GearIcon,
    UserIcon,
    CaretLeftIcon,
} from "phosphor-react-native";
import { buscarFotoPerfil } from "../services/perfilCache";

interface TopBarProps {
    titulo?: string;
    subtitulo?: string;
    tipo?: "normal" | "voltar" | "simples";
}

export default function TopBar({ tipo = "normal" }: TopBarProps) {

    const router = useRouter();
    const pathname = usePathname();
    const [foto, setFoto] = useState<string | null>(null);

    useEffect(() => {
        if (tipo !== "normal") return;
        let ativo = true;
        const carregarFoto = () => {
            void buscarFotoPerfil()
                .then((imagem) => { if (ativo) setFoto(imagem); })
                .catch((erro) => console.error("Erro ao carregar a foto do perfil:", erro));
        };

        carregarFoto();
        const ouvinte = DeviceEventEmitter.addListener("usuarioAtualizado", carregarFoto);
        return () => {
            ativo = false;
            ouvinte.remove();
        };
    }, [tipo]);

    return (
        <View className="px-8 pt-6 pb-4">

            <View className="flex-row items-center">
                {tipo === "normal" ? (
                    <>
                        {/* Configurações à esquerda e perfil à direita. */}
                        <Pressable
                            onPress={() => router.push("/configuracoes")}
                            accessibilityLabel="Abrir configurações"
                            className="w-10 h-10 items-center justify-center"
                        >
                            <GearIcon
                                size={22}
                                color={pathname === "/configuracoes" ? "#58AAF0" : "#D0D0D5"}
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
                            onPress={() => router.push("/perfil")}
                            accessibilityLabel="Abrir meu perfil"
                            className="w-10 h-10 items-center justify-center"
                        >
                            {foto ? (
                                <Image
                                    source={{ uri: foto }}
                                    className="w-9 h-9 rounded-full border border-[#354052]"
                                />
                            ) : (
                                <UserIcon
                                    size={24}
                                    color={pathname === "/perfil" ? "#58AAF0" : "#D0D0D5"}
                                    weight={pathname === "/perfil" ? "fill" : "regular"}
                                />
                            )}
                        </Pressable>
                    </>
                ) : tipo === "voltar" ? (
                    <>
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 items-center justify-center"
                        >
                            <CaretLeftIcon size={24} color="#D0D0D5" />
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

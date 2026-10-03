
import { SafeAreaView } from "react-native-safe-area-context";

import { View, Text, ScrollView, Pressable } from "react-native";

import { useState } from "react";

import {
    UserCircle,
    ShareNetwork,
    DotsThree,
} from "phosphor-react-native";

import Topbar from "../components/topbar";

import Navbar from "@/components/navbar";

import PostCard from "@/components/postCard";

import MusicCard from "@/components/musicCard";


export default function Perfil() {

    const [aba, setAba] = useState<"avaliacoes" | "comentarios">("avaliacoes");


    return (

        <SafeAreaView className="flex-1 bg-[#080A10]">

            {/* Topo */}

            <Topbar
                titulo="Meu perfil"
                subtitulo="Suas músicas e publicações"
                tipo="voltar"
            />


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 90 }}
            >


                {/* Banner + Foto */}

                <View className="relative">

                    {/* Banner */}

                    <View className="h-[135px] bg-[#1C314B]" />


                    {/* Foto */}

                    <View className="absolute left-5 top-[85px] w-[80px] h-[80px] rounded-full bg-[#505A70] items-center justify-center overflow-hidden">

                        <UserCircle
                            size={65}
                            color="#AAB4C5"
                            weight="regular"
                        />

                    </View>

                </View>


                {/* Informações do perfil */}

                <View className="px-5 mt-[10px]">


                    {/* Botões */}

                    <View className="flex-row justify-end items-center gap-3">

                        <Pressable className="w-9 h-9 px-2 rounded-lg flex-row items-center justify-center">

                            <ShareNetwork
                                size={18}
                                color="#FFFFFF"
                                weight="regular"
                            />

                        </Pressable>


                        <Pressable className="w-9 h-9 rounded-lg items-center justify-center">

                            <DotsThree
                                size={21}
                                color="#FFFFFF"
                                weight="bold"
                            />

                        </Pressable>

                    </View>


                    {/* Nome */}

                    <Text className="text-white text-xl font-semibold">
                        Nome
                    </Text>


                    {/* Usuário */}

                    <Text className="text-[#697386] text-sm">
                        @usuario
                    </Text>


                    {/* Bio */}

                    <Text className="text-[#C4CCDA] text-sm mt-2 leading-5">

                        Apaixonado por música e sempre procurando
                        novas músicas para ouvir.

                    </Text>


                    {/* Seguidores / Seguindo */}

                    <View className="flex-row mt-5">

                        <Pressable className="mr-7">

                            <Text className="text-white text-sm font-semibold">
                                120
                            </Text>

                            <Text className="text-[#697386] text-xs mt-1">
                                Seguidores
                            </Text>

                        </Pressable>


                        <Pressable>

                            <Text className="text-white text-sm font-semibold">
                                80
                            </Text>

                            <Text className="text-[#697386] text-xs mt-1">
                                Seguindo
                            </Text>

                        </Pressable>

                    </View>

                </View>


                {/* Músicas salvas */}

                <View className="mt-8">

                    <Text className="text-white text-sm ml-5 mb-3">
                        Músicas salvas
                    </Text>


                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: 20 }}
                    >

                        <MusicCard tipo="quadrado" />

                        <MusicCard tipo="quadrado" />

                        <MusicCard tipo="quadrado" />

                    </ScrollView>

                </View>


                {/* Abas */}

                <View className="flex-row mt-8 border-b border-[#202633]">

                    {/* Avaliações */}

                    <Pressable
                        onPress={() => setAba("avaliacoes")}
                        className="flex-1 items-center"
                    >

                        <Text
                            className={
                                aba === "avaliacoes"
                                    ? "text-white text-sm pb-3"
                                    : "text-[#697386] text-sm pb-3"
                            }
                        >
                            Avaliações
                        </Text>


                        {aba === "avaliacoes" && (

                            <View className="h-[2px] w-[90px] bg-[#58AAF0]" />

                        )}

                    </Pressable>


                    {/* Comentários */}

                    <Pressable
                        onPress={() => setAba("comentarios")}
                        className="flex-1 items-center"
                    >

                        <Text
                            className={
                                aba === "comentarios"
                                    ? "text-white text-sm pb-3"
                                    : "text-[#697386] text-sm pb-3"
                            }
                        >
                            Comentários
                        </Text>


                        {aba === "comentarios" && (

                            <View className="h-[2px] w-[90px] bg-[#58AAF0]" />

                        )}

                    </Pressable>

                </View>


                {/* Conteúdo das abas */}

                <View className="mt-5">


                    {aba === "avaliacoes" ? (

                        <>

                            <PostCard />

                            <View className="mt-4">
                                <PostCard />
                            </View>

                            <View className="mt-4">
                                <PostCard />
                            </View>

                        </>

                    ) : (

                        <>

                            <PostCard />

                            <View className="mt-4">
                                <PostCard />
                            </View>

                        </>

                    )}

                </View>


            </ScrollView>


            {/* Navbar */}

            <Navbar />

        </SafeAreaView>

    );
}


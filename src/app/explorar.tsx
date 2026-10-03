import { SafeAreaView } from "react-native-safe-area-context";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import MusicCard from "../components/musicCard";

import {
    View,
    Text,
    TextInput,
    ScrollView,
} from "react-native";

import { MagnifyingGlassIcon } from "phosphor-react-native";
import Searchbar from "@/components/searchBar";


export default function Explorar() {

    return (

        <SafeAreaView className="flex-1 bg-[#080A10]">

            {/* Topbar */}
            <Topbar
                titulo="Bom dia, Usuário"
                subtitulo="O que você quer descobrir hoje?"
            />


            {/* Conteúdo */}
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
            >

                {/* Busca */}
                <Searchbar />

                {/* ========================= */}
                {/* EM ALTA */}
                {/* ========================= */}

                <Text className="text-white text-lg font-serif mx-8 mt-7 mb-3">
                    Em alta
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-8"
                >

                    <MusicCard tipo="banner" />

                    <MusicCard tipo="banner" />

                    <MusicCard tipo="banner" />

                </ScrollView>


                {/* ========================= */}
                {/* MAIS BEM AVALIADAS */}
                {/* ========================= */}

                <Text className="text-white text-lg font-serif mx-8 mt-7 mb-3">
                    Mais bem avaliadas
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-8"
                >

                    <MusicCard tipo="quadrado" />

                    <MusicCard tipo="quadrado" />

                    <MusicCard tipo="quadrado" />

                    <MusicCard tipo="quadrado" />

                </ScrollView>


                {/* ========================= */}
                {/* TALVEZ VOCÊ GOSTE */}
                {/* ========================= */}

                <Text className="text-white text-lg font-serif mx-8 mt-7 mb-3">
                    Talvez você goste
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="pl-8"
                >

                    <MusicCard tipo="quadrado" />

                    <MusicCard tipo="quadrado" />

                    <MusicCard tipo="quadrado" />

                    <MusicCard tipo="quadrado" />

                </ScrollView>


                {/* Espaço para a Navbar */}
                <View className="h-6" />

            </ScrollView>


            {/* Navbar */}
            <Navbar />

        </SafeAreaView>

    );
}
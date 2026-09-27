import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "../components/navbar";
import { View, Text } from "react-native";
import Topbar from "../components/topbar";
import MusicCard from "../components/musicCard";

export default function Salvos() {
    return (
        <SafeAreaView className="flex-1 bg-[#080A10]">
            {/* Topbar */}
            <Topbar titulo="Salvos" subtitulo="Músicas que você não quer deixar passar" />

            <View className="flex-1 pt-6">
                <MusicCard tipo="post" />
            </View>

            <Navbar />
        </SafeAreaView>
    );
}
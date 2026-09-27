import { View, Text, ScrollView } from "react-native";

import Navbar from "../components/navbar";
import Topbar from "../components/topbar";
import FeedTabs from "../components/FeedTabs";
import PostCard from "../components/postCard";

import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-[#080A10]">

      {/* Topbar */}
      <Topbar
        titulo="Bom dia, Usuário"
        subtitulo="O que você quer descobrir hoje?"
      />

      {/* Feed Tabs */}
      <FeedTabs />

      {/* Feed */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >

        <View className="mt-5">

          {/* Primeiro post */}
          <PostCard />

        </View>

        <View className="h-6" />

        {/* Links para testar as telas */}
        <View className="flex-1 items-center justify-center gap-4">

          <Text className="text-white text-lg font-serif">
            Testar telas
          </Text>

          <Link href="/cadastro">
            <Text className="text-white text-[15px] font-serif underline">
              Cadastro
            </Text>
          </Link>

          <Link href="/login">
            <Text className="text-white text-[15px] font-serif underline">
              Login
            </Text>
          </Link>

        </View>

      </ScrollView>


      {/* Navbar */}
      <Navbar />

    </SafeAreaView>
  );
}
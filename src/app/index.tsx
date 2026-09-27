import { View, Text } from "react-native";
import Navbar from "../components/navbar";

export default function Index() {
  return (
    <View className="flex-1 bg-[#080A10]">

      {/* Conteúdo da página */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-3xl font-bold">
          Maré
        </Text>
      </View>

      {/* Navbar */}
      <Navbar />

    </View>
  );
}
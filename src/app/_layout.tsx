import "../../global.css";

import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View, Image, ActivityIndicator } from "react-native";

export default function RootLayout() {

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {

    const tempo = setTimeout(() => {
      setCarregando(false);
    }, 2000);

    return () => clearTimeout(tempo);

  }, []);

  if (carregando) {

    return (
      <View className="flex-1 bg-[#080A10] items-center justify-center">


        {/* Fundo */}
        <Image
          source={require("../../assets/images/glitter.png")}
          className="absolute w-full h-full"
          resizeMode="contain"
          style={{
            transform: [{ translateY: 200 }],
          }}
        />

        {/* Logo */}
        <Image
          source={require("../../assets/images/logoMare.png")}
          className="w-[240px] h-[240px]"
          resizeMode="contain"
        />

        {/* Carregando */}
        <View className="mt-2">
          <ActivityIndicator
            size="large"
            color="#58AAF0"
          />
        </View>

      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
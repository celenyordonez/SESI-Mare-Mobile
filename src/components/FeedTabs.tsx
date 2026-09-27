import { View, Text, Pressable, Animated } from "react-native";
import { useRef, useState } from "react";

export default function FeedTabs() {

  const [aba, setAba] = useState("paraVoce");

  // Controla a posição da linha
  const linha = useRef(new Animated.Value(0)).current;

  function mudarAba(novaAba: string) {

    setAba(novaAba);

    Animated.spring(linha, {
      toValue: novaAba === "paraVoce" ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }

  return (
    <View className="mt-6">

      {/* Abas */}
      <View className="flex-row">

        {/* Para você */}
        <Pressable
          className="flex-1 items-center pb-3"
          onPress={() => mudarAba("paraVoce")}
        >
          <Text
            className={
              aba === "paraVoce"
                ? "text-[#58AAF0] text-sm font-serif"
                : "text-[#D0D0D5] text-sm font-serif"
            }
          >
            Para você
          </Text>
        </Pressable>


        {/* Seguindo */}
        <Pressable
          className="flex-1 items-center pb-3"
          onPress={() => mudarAba("seguindo")}
        >
          <Text
            className={
              aba === "seguindo"
                ? "text-[#58AAF0] text-sm font-serif"
                : "text-[#D0D0D5] text-sm font-serif"
            }
          >
            Seguindo
          </Text>
        </Pressable>

      </View>


      {/* Linha */}
      <View className="h-[1px] bg-[#171E2B]">

        <Animated.View
          className="h-[2px] bg-[#58AAF0] w-1/2"
          style={{
            transform: [
              {
                translateX: linha.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
              },
            ],
          }}
        />

      </View>

    </View>
  );
}
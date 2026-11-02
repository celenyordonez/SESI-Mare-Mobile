
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    Text,
    View,
} from "react-native";

interface FeedTabsProps {
    abaAtiva: "paraVoce" | "seguindo";
    setAbaAtiva: (aba: "paraVoce" | "seguindo") => void;
}

export default function FeedTabs({
    abaAtiva,
    setAbaAtiva,
}: FeedTabsProps) {
    const linha = useRef(new Animated.Value(
        abaAtiva === "paraVoce" ? 0 : 1
    )).current;

    const [largura, setLargura] = useState(0);

    useEffect(() => {
        Animated.spring(linha, {
            toValue: abaAtiva === "paraVoce" ? 0 : 1,
            useNativeDriver: true,
            tension: 100,
            friction: 12,
        }).start();
    }, [abaAtiva]);

    return (
        <View className="mt-4">
            <View
                className="flex-row"
                onLayout={(event) => {
                    setLargura(event.nativeEvent.layout.width);
                }}
            >
                <Pressable
                    className="flex-1 items-center pb-3"
                    onPress={() => setAbaAtiva("paraVoce")}
                >
                    <Text
                        className={`text-sm font-serif ${
                            abaAtiva === "paraVoce"
                                ? "text-[#58AAF0]"
                                : "text-[#D0D0D5]"
                        }`}
                    >
                        Para você
                    </Text>
                </Pressable>

                <Pressable
                    className="flex-1 items-center pb-3"
                    onPress={() => setAbaAtiva("seguindo")}
                >
                    <Text
                        className={`text-sm font-serif ${
                            abaAtiva === "seguindo"
                                ? "text-[#58AAF0]"
                                : "text-[#D0D0D5]"
                        }`}
                    >
                        Seguindo
                    </Text>
                </Pressable>
            </View>

            <View className="h-[1px] bg-[#171E2B]">
                <Animated.View
                    className="h-[2px] w-1/2 bg-[#58AAF0]"
                    style={{
                        transform: [
                            {
                                translateX: linha.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, largura / 2],
                                }),
                            },
                        ],
                    }}
                />
            </View>
        </View>
    );
}

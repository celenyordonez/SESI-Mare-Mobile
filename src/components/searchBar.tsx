import { MagnifyingGlassIcon } from "phosphor-react-native";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";

type SearchbarProps = {
    value?: string;
    onChangeText?: (value: string) => void;
    onPress?: () => void;
    onSubmitEditing?: (value: string) => void;
    onEndEditing?: (value: string) => void;
};

export default function Searchbar({ value, onChangeText, onPress, onSubmitEditing, onEndEditing }: SearchbarProps) {
    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Buscar músicas, artistas e pessoas"
                className="mx-5 mb-3 h-11 flex-row items-center rounded-xl border border-[#252D3C] bg-[#111420] px-3"
                style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
            >
                <MagnifyingGlassIcon size={18} color="#8495A9" />
                <Text className="ml-2 text-sm text-[#718096]">Buscar músicas, artistas e pessoas</Text>
            </Pressable>
        );
    }

    return (
        <View className="mx-5 mb-3 h-11 flex-row items-center rounded-xl border border-[#252D3C] bg-[#111420] px-3">

            <MagnifyingGlassIcon
                size={18}
                color="#60708A"
            />

            <TextInput
                className="flex-1 text-white text-xs ml-2"
                value={value}
                onChangeText={onChangeText}
                placeholder="Buscar músicas, artistas..."
                placeholderTextColor="#60708A"
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={({ nativeEvent }) => {
                    onSubmitEditing?.(nativeEvent.text ?? value ?? "");
                    Keyboard.dismiss();
                }}
                onEndEditing={({ nativeEvent }) => onEndEditing?.(nativeEvent.text ?? value ?? "")}
            />

        </View>
    );
}

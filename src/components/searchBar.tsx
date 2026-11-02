import { MagnifyingGlassIcon } from "phosphor-react-native";
import { TextInput, View } from "react-native";

type SearchbarProps = {
    value?: string;
    onChangeText?: (value: string) => void;
};

export default function Searchbar({ value, onChangeText }: SearchbarProps) {
    return (
        < View className="h-[35px] bg-[#171E2B] rounded-xl flex-row items-center px-3 mb-4 mx-8" >

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
            />

        </View >
    )
}

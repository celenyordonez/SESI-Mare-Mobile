import { MagnifyingGlassIcon } from "phosphor-react-native";
import { TextInput, View } from "react-native";

export default function Searchbar() {
    return (
        < View className="h-[35px] bg-[#171E2B] rounded-xl flex-row items-center px-3 mx-8 mt-4" >

            <MagnifyingGlassIcon
                size={18}
                color="#60708A"
            />

            <TextInput
                className="flex-1 text-white text-xs ml-2"
                placeholder="Buscar..."
                placeholderTextColor="#60708A"
            />

        </View >
    )
}
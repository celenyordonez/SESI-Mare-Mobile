import { View, Text, Pressable } from "react-native";
import {
  HouseLineIcon,
  PlaylistIcon,
  PlusIcon,
  BookmarkSimpleIcon,
  UserIcon,
} from "phosphor-react-native";

export default function Navbar() {
  return (
    <View className="h-[75px] bg-[#111420] border-t border-[#171E2B] flex-row items-center justify-around">

      {/* Início */}
      <Pressable className="items-center">
        <HouseLineIcon size={24} color="#58AAF0" weight="fill" />

        <Text className="text-[#58AAF0] text-xs mt-1">
          Início
        </Text>
      </Pressable>

      {/* Explorar */}
      <Pressable className="items-center">
        <PlaylistIcon size={24} color="#D0D0D5" />

        <Text className="text-[#D0D0D5] text-xs mt-1">
          Explorar
        </Text>
      </Pressable>

      {/* Criar publicação */}
      <Pressable className="w-12 h-12 rounded-full bg-[#58AAF0] items-center justify-center">
        <PlusIcon size={28} color="#FFFFFF" />
      </Pressable>

      {/* Salvos */}
      <Pressable className="items-center">
        <BookmarkSimpleIcon size={24} color="#D0D0D5" />

        <Text className="text-[#D0D0D5] text-xs mt-1">
          Salvos
        </Text>
      </Pressable>

      {/* Perfil */}
      <Pressable className="items-center">
        <UserIcon size={24} color="#D0D0D5" />

        <Text className="text-[#D0D0D5] text-xs mt-1">
          Perfil
        </Text>
      </Pressable>

    </View>
  );
}
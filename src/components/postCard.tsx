import { View, Text, Pressable } from "react-native";

import {
    HeartIcon,
    ChatCircleIcon,
    BookmarkSimpleIcon,
    DotsThreeIcon,
    StarIcon,
    UserIcon,
} from "phosphor-react-native";

import MusicCard from "./musicCard";

export default function PostCard() {
    return (
        <View className="mx-5 py-4 border-b border-[#171E2B]">

            {/* Usuário */}
            <View className="flex-row items-center">

                {/* Ícone do usuário */}
                <View className="w-10 h-10 rounded-full bg-[#171E2B] items-center justify-center">
                    <UserIcon
                        size={23}
                        color="#D0D0D5"
                    />
                </View>

                {/* Nome */}
                <View className="ml-3 flex-1">

                    <Text className="text-white text-sm font-serif">
                        Nome do usuário
                    </Text>

                    <Text className="text-[#687386] text-xs mt-0.5">
                        @usuario
                    </Text>

                </View>

                {/* Opções */}
                <Pressable>
                    <DotsThreeIcon
                        size={22}
                        color="#D0D0D5"
                    />
                </Pressable>

            </View>


            {/* Texto */}
            <Text className="text-[#D0D0D5] text-sm font-serif mt-3 leading-5">
                Essa música é simplesmente incrível! Já estou ouvindo
                faz alguns dias e não consigo parar.
            </Text>

            {/* Avaliação feita pelo usuário */}
            <View className="flex-row items-center mt-3">

                <StarIcon
                    size={14}
                    color="#58AAF0"
                    weight="fill"
                />

                <Text className="text-white text-xs ml-1">
                    5,0
                </Text>

                <Text className="text-[#687386] text-xs ml-1">
                    avaliação do usuário
                </Text>

            </View>


            {/* Música */}
            <View className="mt-3">
                <MusicCard tipo="post" />
            </View>


            {/* Ações */}
            <View className="flex-row items-center mt-4">

                {/* Curtidas */}
                <Pressable className="flex-row items-center mr-7">

                    <HeartIcon
                        size={20}
                        color="#D0D0D5"
                    />

                    <Text className="text-[#D0D0D5] text-xs ml-1">
                        24
                    </Text>

                </Pressable>


                {/* Comentários */}
                <Pressable className="flex-row items-center mr-7">

                    <ChatCircleIcon
                        size={20}
                        color="#D0D0D5"
                    />

                    <Text className="text-[#D0D0D5] text-xs ml-1">
                        8
                    </Text>

                </Pressable>

            </View>

        </View>
    );
}
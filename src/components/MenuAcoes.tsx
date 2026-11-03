import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XIcon } from "phosphor-react-native";

type MenuAcoesProps = {
    aberto: boolean;
    titulo: string;
    aoFechar: () => void;
    children: ReactNode;
};

type ItemMenuProps = {
    titulo: string;
    descricao?: string;
    icone?: ReactNode;
    aoPressionar: () => void;
    destrutivo?: boolean;
    desabilitado?: boolean;
};

/** Menu inferior compartilhado para manter os menus de três pontos consistentes. */
export function MenuAcoes({ aberto, titulo, aoFechar, children }: MenuAcoesProps) {
    return (
        <Modal visible={aberto} transparent animationType="slide" onRequestClose={aoFechar}>
            <View className="flex-1 justify-end">
                <Pressable className="absolute inset-0 bg-black/60" onPress={aoFechar} accessibilityLabel="Fechar menu" />
                <SafeAreaView edges={["bottom"]} className="justify-end">
                    <View className="rounded-t-3xl border-t border-[#C5D3E1] bg-white px-4 pb-3 pt-3 dark:border-[#293143] dark:bg-[#111420]">
                        <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#C5D3E1] dark:bg-[#354052]" />
                        <View className="mb-2 flex-row items-center justify-between">
                            <Text className="font-serif text-lg text-[#142338] dark:text-white">{titulo}</Text>
                            <Pressable onPress={aoFechar} accessibilityLabel="Fechar menu" className="h-9 w-9 items-center justify-center rounded-full bg-[#F4F7FA] dark:bg-[#171E2B]">
                                <XIcon size={18} color="#8793A7" />
                            </Pressable>
                        </View>
                        <View className="mt-1">{children}</View>
                        <Pressable onPress={aoFechar} className="mt-2 min-h-11 items-center justify-center border-t border-[#D5E0EC] pt-3 dark:border-[#252D3C]">
                            <Text className="text-sm font-medium text-[#52677F] dark:text-[#9AA6BA]">Cancelar</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

export function ItemMenuAcao({
    titulo,
    descricao,
    icone,
    aoPressionar,
    destrutivo = false,
    desabilitado = false,
}: ItemMenuProps) {
    const cor = destrutivo ? "#E2717C" : "#58AAF0";

    return (
        <Pressable
            onPress={aoPressionar}
            disabled={desabilitado}
            accessibilityRole="button"
            className="mb-1 min-h-14 flex-row items-center rounded-xl px-2 py-2 active:bg-[#EAF1F8] dark:active:bg-[#171E2B]"
            style={{ opacity: desabilitado ? 0.5 : 1 }}
        >
            {icone ? (
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: destrutivo ? "rgba(226,113,124,0.12)" : "rgba(88,170,240,0.12)" }}>
                    {icone}
                </View>
            ) : null}
            <View className="flex-1">
                <Text className={`text-sm font-medium ${destrutivo ? "text-[#C64F5B] dark:text-[#F08B8B]" : "text-[#142338] dark:text-white"}`}>
                    {titulo}
                </Text>
                {descricao ? <Text className="mt-0.5 text-xs text-[#52677F] dark:text-[#8793A7]">{descricao}</Text> : null}
            </View>
        </Pressable>
    );
}

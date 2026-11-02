import { Pressable, Text, View } from "react-native";
import type { ToastConfig, ToastConfigParams } from "react-native-toast-message";
import {
    CheckCircleIcon,
    InfoIcon,
    WarningCircleIcon,
} from "phosphor-react-native";

type TipoToast = "success" | "error" | "info";

function CartaoToast({
    tipo,
    texto,
    detalhe,
    aoPressionar,
}: {
    tipo: TipoToast;
    texto?: string;
    detalhe?: string;
    aoPressionar: () => void;
}) {
    const cor = tipo === "success" ? "#58A9E8" : tipo === "error" ? "#FB7185" : "#8D96A6";
    const Icone = tipo === "success" ? CheckCircleIcon : tipo === "error" ? WarningCircleIcon : InfoIcon;

    return (
        <Pressable
            onPress={aoPressionar}
            accessibilityRole="alert"
            style={{
                width: "92%",
                alignSelf: "center",
                minHeight: 58,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#2D3A4F",
                borderRadius: 14,
                backgroundColor: "#151D2B",
                paddingHorizontal: 16,
                paddingVertical: 12,
                shadowColor: "#000000",
                shadowOpacity: 0.28,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
            }}
        >
            <Icone size={22} color={cor} weight="fill" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                {texto ? (
                    <Text style={{ color: "#F3F6FB", fontSize: 14, fontWeight: "600" }}>
                        {texto}
                    </Text>
                ) : null}
                {detalhe ? (
                    <Text style={{ color: "#AAB5C6", fontSize: 12, lineHeight: 17, marginTop: texto ? 3 : 0 }}>
                        {detalhe}
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

function criarToast(tipo: TipoToast) {
    return ({ text1, text2, onPress }: ToastConfigParams<unknown>) => (
        <CartaoToast tipo={tipo} texto={text1} detalhe={text2} aoPressionar={onPress} />
    );
}

export const mareToastConfig: ToastConfig = {
    success: criarToast("success"),
    error: criarToast("error"),
    info: criarToast("info"),
};

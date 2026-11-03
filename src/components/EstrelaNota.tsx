import { Pressable, View } from "react-native";
import { StarIcon } from "phosphor-react-native";

type PropriedadesEstrelaNota = {
    estrela: number;
    nota: number;
    tamanho?: number;
    aoSelecionar?: (nota: number) => void;
};

/** Mostra e seleciona notas em passos de meia estrela. */
export default function EstrelaNota({
    estrela,
    nota,
    tamanho = 28,
    aoSelecionar,
}: PropriedadesEstrelaNota) {
    const preenchimento = nota >= estrela ? 100 : nota >= estrela - 0.5 ? 50 : 0;
    const corPreenchida = "#58AAF0";
    const corVazia = "#52627C";

    return (
        <View style={{ width: tamanho, height: tamanho, marginRight: 4 }}>
            <StarIcon size={tamanho} color={corVazia} weight="regular" />
            {preenchimento > 0 ? (
                <View
                    pointerEvents="none"
                    style={{ position: "absolute", left: 0, top: 0, width: `${preenchimento}%`, height: tamanho, overflow: "hidden" }}
                >
                    <StarIcon size={tamanho} color={corPreenchida} weight="fill" />
                </View>
            ) : null}
            {aoSelecionar ? (
                <>
                    {estrela > 1 ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Dar nota ${String(estrela - 0.5).replace(".", ",")}`}
                            accessibilityState={{ selected: nota === estrela - 0.5 }}
                            onPress={() => aoSelecionar(estrela - 0.5)}
                            style={{ position: "absolute", left: 0, top: 0, width: "50%", height: tamanho }}
                        />
                    ) : null}
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Dar nota ${estrela}`}
                        accessibilityState={{ selected: nota === estrela }}
                        onPress={() => aoSelecionar(estrela)}
                        style={{ position: "absolute", right: 0, top: 0, width: estrela === 1 ? "100%" : "50%", height: tamanho }}
                    />
                </>
            ) : null}
        </View>
    );
}

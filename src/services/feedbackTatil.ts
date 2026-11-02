import * as Haptics from "expo-haptics";

/** Feedback discreto, compatível com iOS, Android e Expo Go. */
export function feedbackSelecao() {
    void Haptics.selectionAsync().catch(() => undefined);
}

export function feedbackAcao() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}


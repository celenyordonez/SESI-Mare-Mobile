import "../../global.css";

import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { mareToastConfig } from "../components/MareToast";
import { configurarExibicaoDePush } from "../services/notificacaoPushService";

configurarExibicaoDePush();

export default function RootLayout() {
  const router = useRouter();
  const ultimaRespostaProcessada = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    function abrirDestinoPush(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      const identificador = response.notification.request.identifier;
      if (ultimaRespostaProcessada.current === identificador) return;
      ultimaRespostaProcessada.current = identificador;

      const dados = response.notification.request.content.data as Record<string, unknown>;
      if (dados.tipo === "mensagem" && dados.conversaId != null) {
        router.push({
          pathname: "/mensagens/[id]",
          params: {
            id: String(dados.conversaId),
            nome: String(dados.nome ?? "Conversa"),
            username: String(dados.username ?? ""),
            foto: String(dados.foto ?? ""),
          },
        } as never);
      } else if (dados.tipo === "seguir") {
        router.push("/notificacoes");
      } else if (dados.postId != null) {
        router.push(`/post/${dados.postId}` as never);
      } else if (dados.musicaId != null) {
        router.push(`/musica/${dados.musicaId}` as never);
      } else if (typeof dados.username === "string") {
        router.push(`/u/${encodeURIComponent(dados.username)}` as never);
      }
    }

    const ouvinte = Notifications.addNotificationResponseReceivedListener(abrirDestinoPush);
    void Notifications.getLastNotificationResponseAsync().then(abrirDestinoPush);
    return () => ouvinte.remove();
  }, [router]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      />
      <Toast
        config={mareToastConfig}
        position="top"
        topOffset={56}
        visibilityTime={3500}
        swipeable
      />
    </>
  );
}

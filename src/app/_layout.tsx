import "../../global.css";

import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { mareToastConfig } from "../components/MareToast";
import { configurarExibicaoDePush } from "../services/notificacaoPushService";
import { ContadoresNavegacaoProvider } from "../components/ContadoresNavegacao";
import { TemaProvider } from "../components/TemaProvider";
import { enviarMensagem, marcarConversaComoLida } from "../services/mensagemPrivadaService";

configurarExibicaoDePush();

export default function RootLayout() {
  const router = useRouter();
  const ultimaRespostaProcessada = useRef<string | null>(null);

  useEffect(() => {
    void Notifications.setNotificationCategoryAsync("mare_mensagem", [
      {
        identifier: "responder",
        buttonTitle: "Responder",
        textInput: {
          placeholder: "Escreva uma mensagem",
          submitButtonTitle: "Enviar",
        },
      },
      {
        identifier: "marcar_como_lida",
        buttonTitle: "Marcar como lida",
      },
    ]).catch((erro) => console.warn("Não foi possível preparar a resposta rápida:", erro));

    async function abrirDestinoPush(response: Notifications.NotificationResponse | null) {
      if (!response) return;
      const identificador = response.notification.request.identifier;
      if (ultimaRespostaProcessada.current === identificador) return;
      ultimaRespostaProcessada.current = identificador;

      const dados = response.notification.request.content.data as Record<string, unknown>;
      if (dados.tipo === "mensagem" && dados.conversaId != null) {
        if (response.actionIdentifier === "marcar_como_lida") {
          try {
            await marcarConversaComoLida(Number(dados.conversaId));
          } catch (erro) {
            console.warn("Não foi possível marcar a conversa como lida:", erro);
            router.push({ pathname: "/mensagens/[id]", params: { id: String(dados.conversaId) } } as never);
          }
          return;
        }
        if (response.actionIdentifier === "responder" && response.userText?.trim()) {
          try {
            await enviarMensagem(Number(dados.conversaId), response.userText.trim());
          } catch (erro) {
            console.warn("Não foi possível responder pela notificação; abrindo a conversa:", erro);
          }
        }
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
    <TemaProvider>
      <ContadoresNavegacaoProvider>
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
      </ContadoresNavegacaoProvider>
    </TemaProvider>
  );
}

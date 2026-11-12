<p align="center"><img src="assets/images/logo.png" alt="Logo da Maré" width="116"></p>

<h1 align="center">Maré Mobile</h1>

<p align="center"><strong>Sua descoberta musical cabe no bolso.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-182638?logo=react&logoColor=58AAF0" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-182638?logo=expo&logoColor=58AAF0" alt="Expo">
  <img src="https://img.shields.io/badge/TypeScript-182638?logo=typescript&logoColor=58AAF0" alt="TypeScript">
</p>

O aplicativo da Maré leva o feed, os perfis, as avaliações e as conversas para o celular. Web e mobile compartilham contas e conteúdo porque usam a mesma API.

## Além do feed

Na **Descoberta**, a pessoa passa por músicas e decide se quer avaliá-las. A **Roleta Musical** sorteia uma faixa do catálogo. O **Duelo Musical** coloca duas músicas lado a lado; o **Bingo Musical** acompanha metas de avaliações e salvamentos. Há ainda **Música para o seu momento**, **Minha Maré**, notificações e um widget Android com a música do dia. As telas podem seguir o tema claro, escuro ou o do aparelho e algumas recebem cores das capas.

## Começando

Requer Node.js, um ambiente Expo compatível com as dependências do projeto e a [API da Maré](../SESI-Mare-Backend/README.md).

```bash
npm install
```

Crie um `.env` neste diretório:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_NA_REDE:3000
```

Use o IP da máquina que executa a API ao testar em um celular físico. `localhost` no celular aponta para o próprio celular. Inicie com `npm run start`. O projeto usa módulos nativos, notificações e um widget Android; algumas funções exigem um *development build* em vez do Expo Go.

## Mapa do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/app` | Telas e rotas do Expo Router |
| `src/components` | Cartões, navegação e interface |
| `src/services` | API, sessão, notificações e música |
| `src/hooks` | Estado reutilizável das telas |
| `src/widgets` | Widget de música do dia |
| `plugins` | Configuração nativa do widget Android |
| `app.json` | Identidade, permissões e plugins |

React Native desenha a interface; Expo gerencia a construção e os módulos do aparelho; Expo Router organiza as rotas. TypeScript confere os contratos entre telas e serviços. NativeWind e estilos do React Native compõem o visual. AsyncStorage guarda a sessão local.

Execute `npx tsc --noEmit` para checar os tipos. A variável `EXPO_PUBLIC_API_URL` é pública no pacote e deve conter apenas o endereço da API. Veja o [guia do projeto](../docs/guia-do-projeto.md) para as integrações.

## Para apresentar

O guia explica as regras de cada experiência do app, incluindo o que fica salvo na conta e o que existe só durante a sessão do jogo. Isso ajuda a mostrar por que recursos que parecem semelhantes têm propósitos diferentes.

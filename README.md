# 🌊 Maré — Mobile

**A experiência Maré na palma da sua mão.**

O Maré Mobile é a versão mobile da plataforma social Maré, desenvolvida para proporcionar uma experiência mais direcionada ao uso em dispositivos móveis.

A aplicação permite que os usuários acompanhem suas comunidades musicais, compartilhem avaliações, descubram músicas e interajam com outros perfis diretamente pelo celular.

## 📱 Tecnologias

- **React Native** — Desenvolvimento mobile.
- **Expo** — Plataforma de desenvolvimento.
- **Expo Router** — Navegação e gerenciamento de rotas.
- **TypeScript** — Tipagem estática.
- **NativeWind** — Estilização com classes utilitárias.
- **Phosphor React Native** — Biblioteca de ícones.
- **AsyncStorage** — Armazenamento local de dados.
- **Expo Linear Gradient** — Gradientes e elementos visuais.

## ✨ Funcionalidades

- Autenticação de usuários.
- Gerenciamento de sessão.
- Feed de publicações.
- Avaliações musicais.
- Curtidas e comentários.
- Perfis de usuários.
- Sistema de seguidores.
- Pesquisa de músicas e usuários.
- Salvamento de músicas.
- Recomendações musicais.
- Notificações.
- Navegação adaptada para dispositivos móveis.

## 📁 Estrutura do projeto

```text
mobile/
├── app/
│   ├── (tabs)/
│   ├── login.tsx
│   ├── cadastro.tsx
│   └── index.tsx
├── src/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── contexts/
│   ├── types/
│   └── utils/
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

*A estrutura pode variar conforme a organização atual do projeto.*

## ⚙️ Como executar

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
cd nome-do-repositorio
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o endereço da API

Configure o endereço da API no serviço responsável pelas requisições.

Exemplo:

```ts
export const API_URL = "http://SEU_IP_LOCAL:3000";
```

**Importante:** ao testar em um dispositivo físico, utilize o endereço IP da máquina que está executando o backend, e não `localhost`.

### 4. Inicie o Expo

```bash
npx expo start
```

Utilize o aplicativo Expo Go ou um ambiente de desenvolvimento compatível para executar a aplicação.

## 📲 Proposta mobile

Enquanto a versão web oferece uma experiência mais ampla para diferentes tamanhos de tela, o aplicativo mobile busca priorizar:

- Navegação simplificada.
- Interface pensada para toque.
- Componentes adaptados para telas menores.
- Acesso rápido às principais funcionalidades.
- Experiência mais próxima de um aplicativo nativo.

## 🔗 Integração

O aplicativo utiliza a mesma API e estrutura de dados da versão web, permitindo que os usuários acessem suas contas e conteúdos em ambas as plataformas.

---

Desenvolvido como parte do projeto acadêmico **Maré — TCC**.
import { Box, Button, Column, Image, Row, Text } from "@expo/ui/jetpack-compose";
import { background, cornerRadius, fillMaxSize, paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import { createWidget } from "expo-widgets";

export type DadosWidgetMusicaDoDia = {
    indice: number;
    titulo: string;
    artista: string;
    genero: string;
    capa: string;
};

function WidgetMaisParaExplorar(dados: DadosWidgetMusicaDoDia) {
    "widget";

    const funcoes = [
        {
            titulo: "Descoberta",
            descricao: "Músicas novas, do seu jeito.",
            cor: "#8CC8FF",
            rota: "/descoberta",
        },
        {
            titulo: "Minha Maré",
            descricao: "O retrato do seu gosto musical.",
            cor: "#83D9C9",
            rota: "/universo",
        },
        {
            titulo: "Roleta musical",
            descricao: "Deixe o acaso escolher uma faixa.",
            cor: "#F5C879",
            rota: "/roleta",
        },
        {
            titulo: "Duelo musical",
            descricao: "Escolha a sua favorita.",
            cor: "#B9A1FF",
            rota: "/duelo",
        },
        {
            titulo: "Seu Momento",
            descricao: "Música para o que você sente.",
            cor: "#FF9A8B",
            rota: "/momento",
        },
        {
            titulo: "Bingo musical",
            descricao: "Complete desafios musicais.",
            cor: "#FFB77A",
            rota: "/bingo",
        },
    ];
    const quantidadeSlides = funcoes.length + 1;
    const indice = ((dados.indice % quantidadeSlides) + quantidadeSlides) % quantidadeSlides;
    const musicaDoDia = indice === 0;
    const funcao = musicaDoDia ? null : funcoes[indice - 1];
    const titulo = musicaDoDia ? (dados.titulo || "Música do dia") : funcao!.titulo;
    const descricao = musicaDoDia
        ? [dados.artista, dados.genero].filter(Boolean).join(" · ") || "Sua escolha musical de hoje"
        : funcao!.descricao;
    const cor = musicaDoDia ? "#58AAF0" : funcao!.cor;
    const rota = musicaDoDia ? "/home" : funcao!.rota;

    return (
        <Box
            modifiers={[
                fillMaxSize(),
                background("#111420"),
                cornerRadius(18),
            ]}
        >
            {dados.capa ? (
                <Image
                    source={{ uri: dados.capa }}
                    contentScale="crop"
                    contentDescription={musicaDoDia ? `Capa de ${titulo}` : null}
                    alpha={musicaDoDia ? 0.5 : 0.24}
                    modifiers={[fillMaxSize(), cornerRadius(18)]}
                />
            ) : null}

            <Column
                verticalArrangement="spaceBetween"
                modifiers={[fillMaxSize(), paddingAll(10)]}
            >
                <Row verticalAlignment="center" horizontalArrangement="spaceBetween">
                    <Text color="#FFFFFF" style={{ fontSize: 9, fontWeight: "700" }} maxLines={1} overflow="ellipsis">
                        {musicaDoDia ? "MÚSICA DO DIA" : "MAIS PARA EXPLORAR"}
                    </Text>
                    <Text color={cor} style={{ fontSize: 9, fontWeight: "700" }}>
                        {indice + 1}/{quantidadeSlides}
                    </Text>
                </Row>

                <Column verticalArrangement="center">
                    <Text color="#FFFFFF" style={{ fontSize: 15, fontWeight: "700" }} maxLines={2} overflow="ellipsis">
                        {titulo}
                    </Text>
                    <Text color="#F0F3F7" style={{ fontSize: 10, fontWeight: "500" }} maxLines={1} overflow="ellipsis">
                        {descricao}
                    </Text>
                </Column>

                <Row verticalAlignment="center" horizontalArrangement="spaceBetween">
                    <Button
                        {...({ target: "mare-anterior" } as object)}
                        onClick={() => ({ indice: (indice + quantidadeSlides - 1) % quantidadeSlides })}
                        colors={{ containerColor: "#202838", contentColor: "#FFFFFF" }}
                        contentPadding={{ start: 7, end: 7, top: 1, bottom: 1 }}
                    >
                        <Text color="#FFFFFF" style={{ fontSize: 15, fontWeight: "700" }}>‹</Text>
                    </Button>

                    <Button
                        {...({ target: `mare-open:${rota}` } as object)}
                        onClick={() => ({ indice })}
                        colors={{ containerColor: cor, contentColor: "#08111B" }}
                        contentPadding={{ start: 10, end: 10, top: 2, bottom: 2 }}
                    >
                        <Text color="#08111B" style={{ fontSize: 10, fontWeight: "700" }}>Abrir</Text>
                    </Button>

                    <Button
                        {...({ target: "mare-proximo" } as object)}
                        onClick={() => ({ indice: (indice + 1) % quantidadeSlides })}
                        colors={{ containerColor: "#202838", contentColor: "#FFFFFF" }}
                        contentPadding={{ start: 7, end: 7, top: 1, bottom: 1 }}
                    >
                        <Text color="#FFFFFF" style={{ fontSize: 15, fontWeight: "700" }}>›</Text>
                    </Button>
                </Row>
            </Column>
        </Box>
    );
}

export default createWidget<DadosWidgetMusicaDoDia>("MusicaDoDia", WidgetMaisParaExplorar, {
    indice: 0,
    titulo: "",
    artista: "",
    genero: "",
    capa: "",
});

import { Button, Column, Image, Row, Text } from "@expo/ui/jetpack-compose";
import { background, cornerRadius, fillMaxSize, padding, paddingAll, size } from "@expo/ui/jetpack-compose/modifiers";
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
        <Column
            verticalArrangement="spaceBetween"
            modifiers={[
                fillMaxSize(),
                background("#111420"),
                cornerRadius(20),
                paddingAll(14),
            ]}
        >
            <Text color="#8793A7" style={{ fontSize: 10, fontWeight: "700" }} maxLines={1} overflow="ellipsis">
                {musicaDoDia ? "MARÉ · MÚSICA DO DIA" : "MARÉ · MAIS PARA EXPLORAR"}
            </Text>

            <Row verticalAlignment="center">
                {musicaDoDia && dados.capa ? (
                    <Image
                        source={{ uri: dados.capa }}
                        contentScale="crop"
                        contentDescription={`Capa de ${titulo}`}
                        modifiers={[size(62, 62), cornerRadius(10)]}
                    />
                ) : (
                    <Text color={cor} style={{ fontSize: 34, fontWeight: "700" }} modifiers={[size(62, 62)]}>
                        {musicaDoDia ? "♪" : "✦"}
                    </Text>
                )}

                <Column verticalArrangement="center" modifiers={[padding(12, 0, 0, 0)]}>
                    <Text color="#FFFFFF" style={{ fontSize: 17, fontWeight: "700" }} maxLines={1} overflow="ellipsis">
                        {titulo}
                    </Text>
                    <Text color="#B7C1D0" style={{ fontSize: 12 }} maxLines={2} overflow="ellipsis">
                        {descricao}
                    </Text>
                </Column>
            </Row>

            <Row verticalAlignment="center" horizontalArrangement="spaceBetween">
                <Button
                    {...({ target: "mare-anterior" } as object)}
                    onClick={() => ({ indice: (indice + quantidadeSlides - 1) % quantidadeSlides })}
                    colors={{ containerColor: "#202838", contentColor: "#D0D8E4" }}
                    contentPadding={{ start: 12, end: 12, top: 4, bottom: 4 }}
                >
                    <Text color="#D0D8E4" style={{ fontSize: 18, fontWeight: "700" }}>‹</Text>
                </Button>

                <Text color={cor} style={{ fontSize: 11, fontWeight: "700" }}>
                    {indice + 1} / {quantidadeSlides}
                </Text>

                <Button
                    {...({ target: "mare-proximo" } as object)}
                    onClick={() => ({ indice: (indice + 1) % quantidadeSlides })}
                    colors={{ containerColor: "#202838", contentColor: "#D0D8E4" }}
                    contentPadding={{ start: 12, end: 12, top: 4, bottom: 4 }}
                >
                    <Text color="#D0D8E4" style={{ fontSize: 18, fontWeight: "700" }}>›</Text>
                </Button>

                <Button
                    {...({ target: `mare-open:${rota}` } as object)}
                    onClick={() => ({ indice })}
                    colors={{ containerColor: cor, contentColor: "#08111B" }}
                    contentPadding={{ start: 12, end: 12, top: 4, bottom: 4 }}
                >
                    <Text color="#08111B" style={{ fontSize: 12, fontWeight: "700" }}>Abrir</Text>
                </Button>
            </Row>
        </Column>
    );
}

export default createWidget<DadosWidgetMusicaDoDia>("MusicaDoDia", WidgetMaisParaExplorar, {
    indice: 0,
    titulo: "",
    artista: "",
    genero: "",
    capa: "",
});

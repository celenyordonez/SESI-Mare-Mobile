import { Box, Button, Column, Row, Text } from "@expo/ui/jetpack-compose";
import { background, cornerRadius, fillMaxSize, paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import { createWidget } from "expo-widgets";

type DadosJogos = { indice: number };

function WidgetJogosMusicais(dados: DadosJogos) {
    "widget";
    const jogos = [
        { nome: "Roleta musical", detalhe: "Deixe o acaso escolher", rota: "/roleta", cor: "#F5C879" },
        { nome: "Duelo musical", detalhe: "Escolha sua favorita", rota: "/duelo", cor: "#B9A1FF" },
        { nome: "Seu Momento", detalhe: "Música para agora", rota: "/momento", cor: "#FF9A8B" },
        { nome: "Bingo musical", detalhe: "Complete seus desafios", rota: "/bingo", cor: "#FFB77A" },
    ];
    const indice = ((dados.indice % jogos.length) + jogos.length) % jogos.length;
    const jogo = jogos[indice];

    return (
        <Box modifiers={[fillMaxSize(), background("#101521"), cornerRadius(18)]}>
            <Column verticalArrangement="spaceBetween" modifiers={[fillMaxSize(), paddingAll(12)]}>
                <Row verticalAlignment="center" horizontalArrangement="spaceBetween">
                    <Text color="#D8CCFF" style={{ fontSize: 9, fontWeight: "700" }}>JOGOS MUSICAIS</Text>
                    <Text color={jogo.cor} style={{ fontSize: 9, fontWeight: "700" }}>{indice + 1}/4</Text>
                </Row>
                <Column verticalArrangement="center">
                    <Text color="#FFFFFF" style={{ fontSize: 17, fontWeight: "700" }} maxLines={1} overflow="ellipsis">{jogo.nome}</Text>
                    <Text color="#D5DEEA" style={{ fontSize: 11 }} maxLines={1} overflow="ellipsis">{jogo.detalhe}</Text>
                </Column>
                <Row verticalAlignment="center" horizontalArrangement="spaceBetween">
                    <Button {...({ target: "mare-jogos-anterior" } as object)} onClick={() => ({ indice: (indice + jogos.length - 1) % jogos.length })} colors={{ containerColor: "#263246", contentColor: "#FFFFFF" }} contentPadding={{ start: 8, end: 8, top: 1, bottom: 1 }}><Text color="#FFFFFF" style={{ fontSize: 15 }}>‹</Text></Button>
                    <Button {...({ target: `mare-open:${jogo.rota}` } as object)} onClick={() => ({ indice })} colors={{ containerColor: jogo.cor, contentColor: "#101521" }} contentPadding={{ start: 16, end: 16, top: 3, bottom: 3 }}><Text color="#101521" style={{ fontSize: 11, fontWeight: "700" }}>Jogar</Text></Button>
                    <Button {...({ target: "mare-jogos-proximo" } as object)} onClick={() => ({ indice: (indice + 1) % jogos.length })} colors={{ containerColor: "#263246", contentColor: "#FFFFFF" }} contentPadding={{ start: 8, end: 8, top: 1, bottom: 1 }}><Text color="#FFFFFF" style={{ fontSize: 15 }}>›</Text></Button>
                </Row>
            </Column>
        </Box>
    );
}

export default createWidget<DadosJogos>("JogosMusicais", WidgetJogosMusicais, { indice: 0 });

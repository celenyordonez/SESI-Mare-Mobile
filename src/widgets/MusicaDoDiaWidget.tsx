import { Box, Button, Column, Image, Text } from "@expo/ui/jetpack-compose";
import { background, cornerRadius, fillMaxSize, paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import { createWidget } from "expo-widgets";

export type DadosWidgetMusicaDoDia = {
    musicaId: number;
    titulo: string;
    artista: string;
    genero: string;
    capa: string;
};

function WidgetMusicaDoDia(dados: DadosWidgetMusicaDoDia) {
    "widget";

    const destino = dados.musicaId > 0 ? `/musica/${dados.musicaId}` : "/home";

    return (
        <Box modifiers={[fillMaxSize(), background("#101521"), cornerRadius(20)]}>
            {dados.capa?.startsWith("file://") ? (
                <Image
                    source={{ uri: dados.capa }}
                    contentScale="crop"
                    contentDescription={dados.titulo ? `Capa de ${dados.titulo}` : "Capa da música do dia"}
                    alpha={0.78}
                    modifiers={[fillMaxSize(), cornerRadius(20)]}
                />
            ) : null}

            {/* Um único alvo de toque deixa o widget inteiro abrir a música. */}
            <Button
                {...({ target: `mare-open:${destino}` } as object)}
                onClick={() => ({ musicaId: dados.musicaId })}
                colors={{ containerColor: "#00000000", contentColor: "#FFFFFF" }}
                contentPadding={{ start: 0, end: 0, top: 0, bottom: 0 }}
                modifiers={[fillMaxSize()]}
            >
                <Column
                    verticalArrangement="spaceBetween"
                    modifiers={[fillMaxSize(), background("#50101521"), cornerRadius(20), paddingAll(14)]}
                >
                    <Text color="#D9ECFF" style={{ fontSize: 10, fontWeight: "700" }} maxLines={1} overflow="ellipsis">
                        MÚSICA DO DIA
                    </Text>

                    <Column verticalArrangement="center">
                        <Text color="#FFFFFF" style={{ fontSize: 17, fontWeight: "700" }} maxLines={2} overflow="ellipsis">
                            {dados.titulo || "Abra a Maré"}
                        </Text>
                        <Text color="#F0F3F7" style={{ fontSize: 12, fontWeight: "500" }} maxLines={1} overflow="ellipsis">
                            {dados.artista || "Conheça a música de hoje"}
                        </Text>
                    </Column>
                </Column>
            </Button>
        </Box>
    );
}

export default createWidget<DadosWidgetMusicaDoDia>("MusicaDoDia", WidgetMusicaDoDia, {
    musicaId: 0,
    titulo: "",
    artista: "",
    genero: "",
    capa: "",
});

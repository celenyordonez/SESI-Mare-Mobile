import React from "react";
import { View, Text, TextInput, Image, ScrollView, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ArtistsScreen() {
    return (
        <LinearGradient colors={["#080B10", "#142437"]} style={styles.container}>

            {/* Logo */}
            <Image
                source={require("../../assets/images/logo-mare1.png")}
                style={styles.logo}
            />

            {/* Título */}
            <View style={styles.header}>
                <Text style={styles.title}>Seus artistas</Text>
                <Text style={styles.subtitle}>
                    Escolha seus artistas favoritos.
                </Text>
            </View>

            {/* Barra de pesquisa */}
            <View style={styles.search}>
                <Text style={styles.searchIcon}>⌕</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Buscar..."
                    placeholderTextColor="#6C7B8F"
                />
            </View>

            {/* Artistas */}
            <ScrollView showsVerticalScrollIndicator={true}>
                <View style={styles.artists}>

                    <View style={styles.artist}>
                        <Image
                            source={require("../../assets/images/theweeknd.jpg")}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>The Weeknd</Text>
                    </View>

                    <View style={styles.artist}>
                        <Image
                            source={require("../../assets/images/arianagrande.webp")}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>Ariana Grande</Text>
                    </View>

                    <View style={styles.artist}>
                        <Image
                            source={require("../../assets/images/anitta.webp")}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>Anitta</Text>
                    </View>

                    <View style={styles.artist}>
                        <Image
                            source={require("../../assets/images/ritalee.webp")}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>Rita Lee</Text>
                    </View>

                    <View style={styles.artist}>
                        <Image
                            source={require("../../assets/images/marisamonte.webp")}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>Marisa Monte</Text>
                    </View>

                    <View style={styles.artist}>
                        <Image
                            source={require("../../assets/images/gilbertogil.webp")}
                            style={styles.artistImage}
                        />
                        <Text style={styles.artistName}>Gilberto Gil</Text>
                    </View>

                </View>
            </ScrollView>

            {/* Botão */}
            <Pressable style={styles.nextButton}>
                <Text style={styles.arrow}>→</Text>
            </Pressable>

        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 35,
        paddingTop: 25,
    },

    logo: {
        width: 190,
        height: 120,
        marginTop: -20,
        marginBottom: -20,
        resizeMode: "contain",
        alignSelf: "center",
    },

    header: {
        alignItems: "center",
        marginBottom: 35,
    },

    title: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "400",
    },

    subtitle: {
        color: "#ddd",
        fontSize: 12,
        marginTop: 6,
    },

    search: {
        height: 28,
        backgroundColor: "#142437",
        borderRadius: 9,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        marginBottom: 30,
    },

    searchIcon: {
        color: "#6C7B8F",
        fontSize: 17,
        marginRight: 7,
    },

    input: {
        flex: 1,
        color: "#fff",
        fontSize: 11,
    },

    artists: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingBottom: 100,
    },

    artist: {
        width: "43%",
        alignItems: "center",
        marginBottom: 32,
    },

    artistImage: {
        width: 92,
        height: 92,
        borderRadius: 46,
        marginBottom: 5,
    },

    emptyImage: {
        width: 92,
        height: 92,
        borderRadius: 46,
        backgroundColor: "#c2d4eb",
        marginBottom: 7,
    },

    artistName: {
        color: "#ddd",
        fontSize: 12,
    },

    nextButton: {
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#55a8ed",
        justifyContent: "center",
        alignItems: "center",
    },

    arrow: {
        color: "#fff",
        fontSize: 28,
        marginBottom: 6
    },
});
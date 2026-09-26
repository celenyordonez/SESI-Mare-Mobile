import React from "react";
import { View, Text, Image, ScrollView, Pressable, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Parte de cima */}
      <View style={styles.topBar}>

        {/* Seta */}
        <Image
          source={require("../../assets/images/seta.png")}
          style={styles.seta}
        />

      </View>

      <View>
        <Text style={styles.title}>Músicas Salvas</Text>
        <Text style={styles.subtitle}>Músicas que você não quer deixar passar.</Text>
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

      {/* Músicas */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
      >

        {/* Música 1 */}
        <View style={styles.post}>

          <View>
            <Text style={styles.quantidadeMusicas}>2 músicas</Text>
          </View>

          {/* Música */}
          <View style={styles.musicCard}>

            <View style={styles.albumCover} />

            <View style={styles.musicInfo}>
              <Text style={styles.musicName}>Música</Text>
              <Text style={styles.artistName}>Artista</Text>
            </View>

            <View style={styles.rating}>
              <Ionicons
                name="star-outline"
                size={21}
                color="#aab4c5"
              />
              <Text style={styles.ratingText}>0.0</Text>
            </View>

          </View>

        </View>


        {/* Música 2 */}
        <View style={styles.post}>

          <View style={styles.musicCard}>

            <View style={styles.albumCover} />

            <View style={styles.musicInfo}>
              <Text style={styles.musicName}>Música</Text>
              <Text style={styles.artistName}>Artista</Text>
            </View>

            <View style={styles.rating}>
              <Ionicons
                name="star-outline"
                size={21}
                color="#aab4c5"
              />
              <Text style={styles.ratingText}>0.0</Text>
            </View>

          </View>

        </View>

      </ScrollView>


      {/* Barra inferior */}
      <View style={styles.bottomBar}>

        <Pressable style={styles.bottomItem}>
          <Ionicons
            name="home"
            size={23}
            color="#fff"
          />
          <Text style={styles.bottomTextActive}>Início</Text>
        </Pressable>

        <Pressable style={styles.bottomItem}>
          <Ionicons
            name="musical-notes-outline"
            size={23}
            color="#fff"
          />
          <Text style={styles.bottomText}>Explorar</Text>
        </Pressable>

        <Pressable style={styles.createButton}>
          <Ionicons
            name="add"
            size={31}
            color="#fff"
          />
          <Text style={styles.bottomText}>Criar</Text>
        </Pressable>

        <Pressable style={styles.bottomItem}>
          <Ionicons
            name="bookmark-outline"
            size={23}
            color="#fff"
          />
          <Text style={styles.bottomText}>Salvos</Text>
        </Pressable>

        <Pressable style={styles.bottomItem}>
          <Ionicons
            name="person"
            size={23}
            color="#fff"
          />
          <Text style={styles.bottomText}>Perfil</Text>
        </Pressable>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0b0e16",
  },

  
  /* Topo */

  topBar: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  seta: {
    width: 15,
    height: 15,
    resizeMode: "contain",
  },


  /* Título e subtítulo */

  title: {
    fontSize: 20,
    color: "#fff",
    marginLeft: 17
  },

  subtitle: {
    fontSize: 14,
    color: "#6C7B8F",
    margin: 17
  },


  /* Barra de Pesquisa */

  search: {
    height: 32,
    width: 400,
    backgroundColor: "#142437",
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 15,
    marginLeft: 16
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


  /* Feed */

  feed: {
    paddingBottom: 80,
  },

  post: {
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 4,
  },

  quantidadeMusicas: {
    color: "#fff",
    fontSize: 18,
    margin: 3,
    marginBottom: 16
  },

  description: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 12,
  },


  /* Música */

  musicCard: {
    height: 84,
    width: 400,
    borderWidth: 1,
    borderColor: "#798397",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    marginLeft: 6
  },

  albumCover: {
    width: 65,
    height: 65,
    borderRadius: 6,
    backgroundColor: "#687184",
  },

  musicInfo: {
    marginLeft: 9,
    alignSelf: "flex-start",
    marginTop: 10,
  },

  musicName: {
    color: "#fff",
    fontSize: 10,
  },

  artistName: {
    color: "#8992a4",
    fontSize: 9,
    marginTop: 2,
  },

  rating: {
    marginLeft: "auto",
    width: 35,
    alignItems: "center",
  },

  ratingText: {
    color: "#8992a4",
    fontSize: 8,
    marginTop: 2,
  },


  /* Curtidas e comentários */

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
  },

  action: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 17,
  },

  actionText: {
    color: "#778195",
    fontSize: 9,
    marginLeft: 4,
  },

  bookmark: {
    marginLeft: "auto",
  },


  /* Navbar */

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 63,
    backgroundColor: "#192E48",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  bottomItem: {
    width: "18%",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomText: {
    color: "#c4ccda",
    fontSize: 9,
    marginTop: 3,
  },

  bottomTextActive: {
    color: "#fff",
    fontSize: 9,
    marginTop: 3,
  },

  createButton: {
    width: "18%",
    alignItems: "center",
    justifyContent: "center",
  },

});
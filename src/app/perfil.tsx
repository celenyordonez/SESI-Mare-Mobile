import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>

      {/* Parte de cima */}
      <View style={styles.topBar}>

        {/* Voltar */}
        <Pressable>
          <Ionicons
            name="chevron-back"
            size={22}
            color="#fff"
          />
        </Pressable>

        {/* Título */}
        <Text style={styles.title}>Perfil</Text>

        {/* Configurações */}
        <Pressable style={styles.caixaPerfil}>
          <Ionicons
            name="settings-outline"
            size={22}
            color="#fff"
          />
        </Pressable>

      </View>


      {/* Perfil */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.profileContent}
      >

        {/* Foto de perfil */}
        <View style={styles.profileIcon}>
          <Ionicons
            name="person-outline"
            size={43}
            color="#515b71"
          />
        </View>

        {/* Nome */}
        <Text style={styles.name}>Nome</Text>


        {/* Playlists */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Playlists
          </Text>

          <View style={styles.blockCards}>
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />

          </ScrollView>
          </View>

        </View>


        {/* Músicas salvas */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Músicas salvas
          </Text>

          <View style={styles.blockCards}>
            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />
            <View style={styles.playlistCard} />

          </ScrollView>
          </View>

        </View>


        {/* Avaliações */}
        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Avaliações
          </Text>

          <View style={styles.reviewCard} />

        </View>

        <View style={styles.section}>

          <View style={styles.reviewCard} />

        </View>

        <View style={styles.section}>

          <View style={styles.reviewCard} />

        </View>

      </ScrollView>


      {/* Navbar */}
      <View style={styles.bottomBar}>

        {/* Início */}
        <Pressable style={styles.bottomItem}>

          <Ionicons
            name="home-outline"
            size={23}
            color="#fff"
          />

          <Text style={styles.bottomText}>
            Início
          </Text>

        </Pressable>


        {/* Explorar */}
        <Pressable style={styles.bottomItem}>

          <Ionicons
            name="musical-notes-outline"
            size={23}
            color="#fff"
          />

          <Text style={styles.bottomText}>
            Explorar
          </Text>

        </Pressable>


        {/* Criar */}
        <Pressable style={styles.createButton}>

          <Ionicons
            name="add"
            size={31}
            color="#fff"
          />

          <Text style={styles.bottomText}>
            Criar
          </Text>

        </Pressable>


        {/* Salvos */}
        <Pressable style={styles.bottomItem}>

          <Ionicons
            name="bookmark-outline"
            size={23}
            color="#fff"
          />

          <Text style={styles.bottomText}>
            Salvos
          </Text>

        </Pressable>


        {/* Perfil */}
        <Pressable style={styles.bottomItem}>

          <Ionicons
            name="person"
            size={23}
            color="#fff"
          />

          <Text style={styles.bottomText}>
            Perfil
          </Text>

        </Pressable>

      </View>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0E1119",
  },


  /* Topo */

  topBar: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  title: {
    position: "absolute",
    left: 50,
    color: "#fff",
    fontSize: 20,
  },


  /* Perfil */

  profileContent: {
    paddingBottom: 85,
  },

  profileIcon: {
    width: 60,
    height: 60,
    borderWidth: 5,
    borderColor: "#515b71",
    borderRadius: 6,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 40,
  },

  caixaPerfil: {
    
  },

  name: {
    color: "#fff",
    fontSize: 20,
    marginLeft: 20,
  },


  /* Seções */

  section: {
    marginTop: 25,
  },

  blockCards: {
    left: 10,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 20,
    marginBottom: 10,
  },

  playlistCard: {
    width: 80,
    height: 80,
    backgroundColor: "#505a70",
    borderRadius: 8,
    marginLeft: 10,
  },

  reviewCard: {
    height: 98,
    marginHorizontal: 20,
    backgroundColor: "#505a70",
    borderRadius: 8,
  },


  /* Navbar */

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 63,
    backgroundColor: "#192E48",
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

  createButton: {
    width: "18%",
    alignItems: "center",
    justifyContent: "center",
  },

});
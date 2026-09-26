import React from "react";
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Parte de cima */}
      <View style={styles.topBar}>

        {/* Logo */}
        <Image
          source={require("../../assets/images/logo-mare2.png")}
          style={styles.logo}
        />

        {/* Notificação */}
        <View style={styles.notification}>
          <Ionicons
            name="notifications-outline"
            size={23}
            color="#fff"
          />

          <View style={styles.notificationNumber}>
            <Text style={styles.notificationText}>1</Text>
          </View>
        </View>

      </View>

      {/* Abas */}
      <View style={styles.tabs}>

        <Pressable style={styles.tabActive}>
          <Text style={styles.tabText}>Para você</Text>
        </Pressable>

        <Pressable style={styles.tab}>
          <Text style={styles.tabTextActive}>Seguindo</Text>
          <Ionicons
            name="chevron-down"
            size={15}
            color="#fff"
          />
        </Pressable>

      </View>

      {/* Linha azul da aba ativa */}
      <View style={styles.activeLine} />

      {/* Publicações */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feed}
      >

        {/* Publicação 1 */}
        <View style={styles.post}>

          <View style={styles.user}>
            <View style={styles.avatar} />

            <Text style={styles.userName}>Usuário</Text>
          </View>

          <Text style={styles.description}>
            Lorem ipsum lorem lorem ipsum...
          </Text>

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

          {/* Interações */}
          <View style={styles.actions}>

            <View style={styles.action}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#778195"
              />
              <Text style={styles.actionText}>18</Text>
            </View>

            <View style={styles.action}>
              <Ionicons
                name="heart-outline"
                size={19}
                color="#778195"
              />
              <Text style={styles.actionText}>5</Text>
            </View>

            <Ionicons
              name="bookmark-outline"
              size={19}
              color="#778195"
              style={styles.bookmark}
            />

          </View>

        </View>


        {/* Publicação 2 */}
        <View style={styles.post}>

          <View style={styles.user}>
            <View style={styles.avatar} />

            <Text style={styles.userName}>Usuário</Text>
          </View>

          <Text style={styles.description}>
            Lorem ipsum lorem lorem ipsum...
          </Text>

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

          <View style={styles.actions}>

            <View style={styles.action}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#778195"
              />
              <Text style={styles.actionText}>18</Text>
            </View>

            <View style={styles.action}>
              <Ionicons
                name="heart-outline"
                size={19}
                color="#778195"
              />
              <Text style={styles.actionText}>5</Text>
            </View>

            <Ionicons
              name="bookmark-outline"
              size={19}
              color="#91b85c"
              style={styles.bookmark}
            />

          </View>

        </View>


        {/* Publicação 3 */}
        <View style={styles.post}>

          <View style={styles.user}>
            <View style={styles.avatar} />

            <Text style={styles.userName}>Usuário</Text>
          </View>

          <Text style={styles.description}>
            Lorem ipsum lorem lorem ipsum...
          </Text>

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

          <View style={styles.actions}>

            <View style={styles.action}>
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color="#778195"
              />
              <Text style={styles.actionText}>18</Text>
            </View>

            <View style={styles.action}>
              <Ionicons
                name="heart-outline"
                size={19}
                color="#778195"
              />
              <Text style={styles.actionText}>5</Text>
            </View>

            <Ionicons
              name="bookmark-outline"
              size={19}
              color="#778195"
              style={styles.bookmark}
            />

          </View>

        </View>

      </ScrollView>


      {/* Navbar */}
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

  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  notification: {
    position: "relative",
  },

  notificationNumber: {
    position: "absolute",
    left: -4,
    bottom: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#5ca9ed",
    justifyContent: "center",
    alignItems: "center",
  },

  notificationText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },


  /* Abas */

  tabs: {
    height: 45,
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#606a7c",
  },

  tabActive: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },

  tab: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4
  },

  tabTextActive: {
    color: "#fff",
    fontSize: 14,
  },

  tabText: {
    color: "#858c9c",
    fontSize: 14,
  },

  activeLine: {
    position: "absolute",
    top: 108,
    left: 220,
    width: "46%",
    height: 3,
    backgroundColor: "#55a8ed",
  },


  /* Feed */

  feed: {
    paddingBottom: 80,
  },

  post: {
    paddingHorizontal: 12,
    paddingTop: 22,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#4f596b",
  },

  user: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#dedfe1",
    marginRight: 10,
  },

  userName: {
    color: "#fff",
    fontSize: 12,
  },

  description: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 12,
  },


  /* Música */

  musicCard: {
    height: 84,
    borderWidth: 1,
    borderColor: "#798397",
    borderRadius: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
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
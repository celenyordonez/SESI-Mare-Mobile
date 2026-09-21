import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

// --- DADOS FICTÍCIOS PARA PREENCHER O ECRÃ ---
const favoritas= [
  { id: '1', 
    image: 'https://i.scdn.co/image/ab67616d0000b2734121fa0c2243d6046e386ce2' 
}, 
  { id: '2',
    image: 'https://i.scdn.co/image/ab67616d0000b27313b3e37318a0c247b550bccd'
 }, 
  { id: '3',
     image: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25'
     },
  { 
    id: '4', 
    image: 'https://picsum.photos/200/200?random=4'
 },
];

const talvezGoste = [
  { id: '1', 
    image: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452'
   }, 
  { id: '2', 
    image: 'https://i.scdn.co/image/ab67616d0000b273934f5dbe368a5c363910cbe8' }, 
  {
     id: '3', 
    image: 'https://i.scdn.co/image/ab67616d0000b273d2a715f5fc81ef3520556e82' },
  { 
    id: '4',
     image: 'https://picsum.photos/200/200?random=5'
     },
];

const outros = [
  { 
    id: '1',
     image: 'https://picsum.photos/200/200?random=6' 
    },
  { 
    id: '2',
     image: 'https://picsum.photos/200/200?random=7'
     },
  { 
    id: '3',
     image: 'https://picsum.photos/200/200?random=8'
     },
   { 
    id: '4',
     image: 'https://picsum.photos/200/200?random=8'
     },
];

export default function ExploreScreen() {
  // Função para simular a navegação ou ações
  const handlePress = (action: string) => {
    console.log(`Ação acionada: ${action}`);
    // Futuramente substituirá por: navigation.navigate('NomeDaPagina')
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* CABEÇALHO */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greetingTitle}>Bom dia, Usuário</Text>
            <Text style={styles.greetingSubtitle}>O que você quer descobrir hoje?</Text>
          </View>
          <TouchableOpacity onPress={() => handlePress('Notificações')} style={styles.notificationBtn}>
            <Feather name="info" size={24} color="#E2E8F0" />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>1</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* BARRA DE PESQUISA */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#64748B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#64748B"
          />
        </View>

        {/*EM ALTA */}
        <Text style={styles.sectionTitle}>Em alta</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress('Álbum Sinfonia do Amanhã')}>
            <ImageBackground
              source={{ uri: 'https://picsum.photos/400/200?random=10' }} // Placeholder synthwave
              style={styles.heroCard}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.heroOverlay}>
                <View style={styles.heroHeader}>
                  <View style={styles.tagContainer}>
                    <Text style={styles.tagText}>NEON SYNTH</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => handlePress('Tocar Sinfonia do Amanhã')}
                  >
                    <Ionicons name="play" size={18} color="#0F172A" style={{ marginLeft: 2 }} />
                  </TouchableOpacity>
                </View>

                <View style={styles.heroFooter}>
                  <Text style={styles.heroTitle}>Sinfonia do Amanhã</Text>
                  <Text style={styles.heroSubtitle} numberOfLines={1}>
                    O álbum instrumental mais ouvido da semana com arranjos...
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </ScrollView>

        {/*MAIS BEM AVALIADAS */}
        <Text style={styles.sectionTitle}>Mais bem avaliadas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {favoritas.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => handlePress(`Álbum Top ${item.id}`)}>
              <Image source={{ uri: item.image }} style={styles.squareCard} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* TALVEZ VOCÊ GOSTE */}
        <Text style={styles.sectionTitle}>Talvez você goste</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {talvezGoste.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => handlePress(`Álbum Recomendado ${item.id}`)}>
              <Image source={{ uri: item.image }} style={styles.squareCard} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* OUTROS */}
        <Text style={styles.sectionTitle}>Outros</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {outros.map((item) => (
            <TouchableOpacity key={item.id} onPress={() => handlePress(`Álbum Outros ${item.id}`)}>
              <Image source={{ uri: item.image }} style={styles.squareCard} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Espaço extra no fundo para a NavBar não sobrepor conteúdo */}
        <View style={{ height: 40 }} />
      </ScrollView>

     

        
    </SafeAreaView>
  );
}

// --- TODOS OS ESTILOS DA PÁGINA ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10141D', // Cor de fundo principal escuro
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  greetingTitle: {
    fontFamily: 'serif', // Dá aquele toque elegante que está na imagem
    fontSize: 22,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  notificationBtn: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3B82F6', // Azul do badge
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10141D',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Fundo da caixa de pesquisa
    marginHorizontal: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 15,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 10,
  },
  horizontalScroll: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  // ESTILOS DO CARD "EM ALTA"
  heroCard: {
    width: 320,
    height: 180,
    marginRight: 15,
    borderRadius: 16,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // Escurece um pouco a imagem de fundo
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  playButton: {
    backgroundColor: '#60A5FA', // Azul claro do botão
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroFooter: {
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  // ESTILOS DOS CARDS QUADRADOS (Álbuns)
  squareCard: {
    width: 110,
    height: 110,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#1E293B',
  },
  
});
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  Image, TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Feather, FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';

const recomendadas = [
  { id: '1', imagem: 'https://i.scdn.co/image/ab67616d0000b2734121fa0c2243d6046e386ce2' }, // Anavitória
  { id: '2', imagem: 'https://i.scdn.co/image/ab67616d0000b27313b3e37318a0c247b550bccd' }, // Oriente
  { id: '3', imagem: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25' }, // Gal Costa
  { id: '4', imagem: 'https://picsum.photos/200/200?random=15' },
];

export default function Criar2() {
  const router = useRouter();

  const [nota, setNota] = useState<number>(0.0);

  // Função para marcar/desmarcar a estrela
  const handleAvaliacao = (valorEstrela: number) => {
    // Se clicar na mesma estrela que já está marcada, reseta para 0
    if (nota === valorEstrela) {
      setNota(0.0);
    } else {
      setNota(valorEstrela);
    }
  };

   const handleAcao = (nomeAcao: string) => {

    console.log(`Ação acionada: ${nomeAcao}`);

  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho com o botão de voltar ao lado do título */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="chevron-left" size={28} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.greetingTitle}>Criar avaliação</Text>
          <Text style={styles.greetingSubtitle}>O que você quer descobrir hoje?</Text>
        </View>
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

      <View style={styles.containerMusica}>

        {/* 1. SECÇÃO: RECOMENDADAS */}
        <Text style={styles.tituloSecao}>Recomendadas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {recomendadas.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.8}>
              <Image source={{ uri: item.imagem }} style={styles.cardRecomendada} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 2. SECÇÃO: MÚSICA SELECIONADA */}
        <Text style={styles.tituloSecao}>Música selecionada</Text>
        <View style={styles.cardMusicaSelecionada}>
          <Image
            source={{ uri: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' }} // Capa Jorge & Mateus
            style={styles.capaMusica}
          />
          <View style={styles.infoMusica}>
            <Text style={styles.nomeMusica}>Calma</Text>
            <Text style={styles.detalhesMusica}>Jorge & Mateus - 2014</Text>
            <Text style={styles.duracaoMusica}>3:07 min</Text>
          </View>
        </View>

        {/* 3. SECÇÃO: SUA NOTA (ESTRELAS INTERATIVAS) */}
        <Text style={styles.tituloSecao}>Sua nota</Text>
        <View style={styles.containerAvaliacao}>
          <View style={styles.estrelasContainer}>
            {[1, 2, 3, 4, 5].map((estrela) => (
              <TouchableOpacity
                key={estrela}
                onPress={() => handleAvaliacao(estrela)}
                activeOpacity={0.7}
                style={styles.botaoEstrela}
              >
                <FontAwesome
                  name={estrela <= nota ? 'star' : 'star-o'}
                  size={32}
                  color="#38BDF8" // Azul claro igual ao da imagem
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.valorNota}>{nota.toFixed(1)}</Text>
        </View>
      </View>

      {/*Comentario */}
      <View>

        <Text style={styles.tituloSecao}>Escreva sobre essa música</Text>
        <TextInput
          style={styles.caixaTextoInput}
          placeholder="Escreva a sua opinião sobre a música..."
          placeholderTextColor="#64748B"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top" // Garante que o cursor começa no topo da caixa no Android
        />
      </View>

       <TouchableOpacity
              
            style={styles.botaoPost}
              
           activeOpacity={0.8}
              
            
              >
              <Text style={styles.textoBotaoPost}>Post</Text>
        </TouchableOpacity>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0E14', // Fundo escuro
  },
  headerContainer: {
    flexDirection: 'row', // Coloca os elementos lado a lado
    alignItems: 'center', // Alinha verticalmente ao centro
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: {
    marginRight: 12, // Espaço entre o ícone e o texto
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1, // Faz os textos ocuparem o restante do espaço disponível
  },
  greetingTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Fundo da barra de pesquisa
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
  containerMusica: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tituloSecao: {
    fontFamily: 'serif',
    fontSize: 18,
    color: '#F8FAFC',
    marginTop: 20,
    marginBottom: 12,
  },
  // ESTILOS DA LISTA RECOMENDADAS
  horizontalScroll: {
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  cardRecomendada: {
    width: 90,
    height: 90,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#1E293B',
  },
  // ESTILOS CARD MÚSICA SELECIONADA
  cardMusicaSelecionada: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D121B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  capaMusica: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  infoMusica: {
    flex: 1,
    justifyContent: 'center',
  },
  nomeMusica: {
    fontFamily: 'serif',
    fontSize: 20,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  detalhesMusica: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
  },
  duracaoMusica: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  // ESTILOS DA AVALIAÇÃO (SUA NOTA)
  containerAvaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  estrelasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoEstrela: {
    marginRight: 10,
  },
  valorNota: {
    color: '#38BDF8', // Azul idêntico ao "5.0" da foto
    fontSize: 26,
    fontWeight: 'bold',
  },
  caixaTextoInput: {
    backgroundColor: '#121721',
    color: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222A38',
    height: 110, // Define a altura da caixa de texto
    fontSize: 14,
    textAlignVertical: 'top',
  },
  // Estilo para o bloco de exibição
  blocoExibicao: {
    backgroundColor: '#121721',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2634',
  },

   botaoPost: {
    backgroundColor: '#4CA3FF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },

  textoBotaoPost: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

});
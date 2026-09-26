import React, { useState } from 'react';

import {

  View,

  Text,

  StyleSheet,

  ScrollView,

  TouchableOpacity,

  Image,

  TextInput,

  StatusBar,

  SafeAreaView,

} from 'react-native';

import { useRouter } from 'expo-router';

import { Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
 
// --- DADOS FICTÍCIOS PARA AS MÚSICAS RELACIONADAS ---

const MusicasRelacionadas = [

  { id: '1', imagem: 'https://i.scdn.co/image/ab67616d0000b2734121fa0c2243d6046e386ce2' },

  { id: '2', imagem: 'https://i.scdn.co/image/ab67616d0000b27313b3e37318a0c247b550bccd' },

  { id: '3', imagem: 'https://i.scdn.co/image/ab67616d0000b273dc30583ba717007b00cceb25' },

  { id: '4', imagem: 'https://picsum.photos/200/200?random=12' },

];
 
export default function DetalhesMusicaScreen() {

  const router = useRouter();
 
  // Estado da avaliação interativa (0 a 5)

  const [avaliacao, setAvaliacao] = useState<number>(0);
 
  // Função para marcar/desmarcar a estrela

  const handleAvaliacao = (nota: number) => {

    // Se clicar na mesma nota que já está selecionada, reseta para 0

    if (avaliacao === nota) {

      setAvaliacao(0);

    } else {

      setAvaliacao(nota);

    }

  };
 
  // Ação fictícia ao pressionar plataformas ou o botão Post

  const handleAcao = (nomeAcao: string) => {

    console.log(`Ação acionada: ${nomeAcao}`);

  };
 
  return (
<SafeAreaView style={styles.container}>
<StatusBar barStyle="light-content" backgroundColor="#0B0E14" />
 
      {/* CABEÇALHO / BOTÃO VOLTAR */}
<View style={styles.header}>
<TouchableOpacity onPress={() => router.back()} style={styles.botaoVoltar}>
<Feather name="chevron-left" size={28} color="#F8FAFC" />
</TouchableOpacity>
</View>
 
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

        {/* CAPA DE CAPA OU PLACEHOLDER DA MÚSICA */}
<View style={styles.capaContainer}>
<View style={styles.capaPlaceholder}>
<Ionicons name="person" size={80} color="#334155" />
</View>
</View>
 
        {/* TÍTULO DA MÚSICA */}
<Text style={styles.tituloMusica}>Música</Text>
 
        {/* SEÇÃO: OUVIR (PLATAFORMAS DE STREAMING) */}
<Text style={styles.tituloSecao}>Ouvir</Text>
<View style={styles.gridPlataformas}>
<TouchableOpacity

            style={styles.botaoPlataforma}

            onPress={() => handleAcao('Abrir Spotify')}
>
<MaterialCommunityIcons name="spotify" size={22} color="#1DB954" />
<Text style={styles.textoPlataforma}>Spotify</Text>
</TouchableOpacity>
 
          <TouchableOpacity

            style={styles.botaoPlataforma}

            onPress={() => handleAcao('Abrir Apple Music')}
>
<MaterialCommunityIcons name="apple" size={22} color="#FA243C" />
<Text style={styles.textoPlataforma}>Apple Music</Text>
</TouchableOpacity>
 
          <TouchableOpacity

            style={styles.botaoPlataforma}

            onPress={() => handleAcao('Abrir YouTube Music')}
>
<MaterialCommunityIcons name="youtube" size={22} color="#FF0000" />
<Text style={styles.textoPlataforma}>YouTube Music</Text>
</TouchableOpacity>
 
          <TouchableOpacity

            style={styles.botaoPlataforma}

            onPress={() => handleAcao('Abrir Amazon Music')}
>

<Text style={styles.textoPlataforma}>Amazon Music</Text>
</TouchableOpacity>
</View>
 
        {/* SEÇÃO: AVALIAÇÃO INTERATIVA */}
<Text style={styles.tituloSecao}>Avaliação</Text>
<View style={styles.containerAvaliacao}>
<View style={styles.estrelasContainer}>

            {[1, 2, 3, 4, 5].map((estrelaIndex) => (
<TouchableOpacity

                key={estrelaIndex}

                onPress={() => handleAvaliacao(estrelaIndex)}

                activeOpacity={0.7}

                style={styles.botaoEstrela}
>
<FontAwesome

                  name={estrelaIndex <= avaliacao ? 'star' : 'star-o'}

                  size={30}

                  color={estrelaIndex <= avaliacao ? '#475569' : '#475569'}

                />
</TouchableOpacity>

            ))}
</View>
<Text style={styles.textoNota}>{avaliacao.toFixed(1)}</Text>
</View>
 
        {/* BOTÃO POST */}
<TouchableOpacity

          style={styles.botaoPost}

          activeOpacity={0.8}

          onPress={() => handleAcao(`Publicar post com nota ${avaliacao}`)}
>
<Text style={styles.textoBotaoPost}>Post</Text>
</TouchableOpacity>
 
        {/* SEÇÃO: MÚSICAS RELACIONADAS */}
<Text style={styles.tituloSecao}>Músicas relacionadas</Text>
<ScrollView

          horizontal

          showsHorizontalScrollIndicator={false}

          style={styles.horizontalScroll}
>

          {MusicasRelacionadas.map((item) => (
<TouchableOpacity

              key={item.id}

              onPress={() => handleAcao(`Abrir música relacionada ${item.id}`)}
>
<Image source={{ uri: item.imagem }} style={styles.cardAlbum} />
</TouchableOpacity>

          ))}
</ScrollView>
 
        {/* SEÇÃO: POSTS RELACIONADOS */}
<Text style={styles.tituloSecao}>Posts relacionados</Text>
<View style={styles.cardPost}>
<View style={styles.headerPost}>
<View style={styles.avatarUsuario} />
<Text style={styles.nomeUsuario}>Usuário</Text>

            {/* Estrelas estáticas do post do usuário */}
<View style={styles.estrelasMinis}>

              {[1, 2, 3, 4, 5].map((i) => (
<FontAwesome key={i} name="star-o" size={12} color="#475569" style={{ marginLeft: 2 }} />

              ))}
</View>
</View>

{/*Criar Comentario <View>
<TextInput
  style={styles.caixaTextoInput}
  placeholder="Escreva a sua opinião sobre a música..."
  placeholderTextColor="#64748B"
  multiline={true}
  numberOfLines={4}
  textAlignVertical="top" // Garante que o cursor começa no topo da caixa no Android
/>

</View>
*/}

<Text style={styles.conteudoPost}>Lorem ipsum lorem lorem ipsum...</Text>
</View>
 
        {/* Espaço no fundo para rolagem confortável */}
<View style={{ height: 30 }} />
</ScrollView>
</SafeAreaView>

  );

}
 
// --- ESTILOS COMPLETO DA PÁGINA ---

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#0B0E14', // Fundo bem escuro exato da foto

  },

  header: {

    paddingHorizontal: 16,

    paddingTop: 10,

    paddingBottom: 5,

  },

  botaoVoltar: {

    width: 40,

    height: 40,

    justifyContent: 'center',

  },

  scrollView: {

    flex: 1,

  },

  scrollContent: {

    paddingHorizontal: 20,

    paddingBottom: 20,

  },

  capaContainer: {

    alignItems: 'center',

    marginVertical: 15,

  },

  capaPlaceholder: {

    width: 140,

    height: 140,

    borderRadius: 16,

    backgroundColor: '#161C26',

    borderWidth: 1,

    borderColor: '#262F3E',

    justifyContent: 'center',

    alignItems: 'center',

  },

  tituloMusica: {

    fontFamily: 'serif',

    fontSize: 22,

    color: '#F8FAFC',

    marginBottom: 20,

  },

  tituloSecao: {

    fontFamily: 'serif',

    fontSize: 18,

    color: '#F8FAFC',

    marginTop: 15,

    marginBottom: 12,

  },

  // ESTILOS DAS PLATAFORMAS (2x2 GRID)

  gridPlataformas: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between',

    gap: 10,

  },

  botaoPlataforma: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#121721',

    borderWidth: 1,

    borderColor: '#222A38',

    borderRadius: 12,

    width: '48%',

    paddingVertical: 10,

    paddingHorizontal: 12,

  },

  textoPlataforma: {

    color: '#E2E8F0',

    fontSize: 13,

    fontWeight: '500',

    marginLeft: 8,

  },

  // ESTILOS DA AVALIAÇÃO COM ESTRELAS

  containerAvaliacao: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    marginVertical: 10,

  },

  estrelasContainer: {

    flexDirection: 'row',

    alignItems: 'center',

  },

  botaoEstrela: {

    marginRight: 8,

    padding: 2,

  },

  textoNota: {

    color: '#64748B',

    fontSize: 22,

    fontWeight: '600',

  },

  // BOTÃO POST

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

  // MÚSICAS RELACIONADAS

  horizontalScroll: {

    marginHorizontal: -20,

    paddingLeft: 20,

    marginBottom: 10,

  },

  cardAlbum: {

    width: 90,

    height: 90,

    borderRadius: 12,

    marginRight: 12,

    backgroundColor: '#161C26',

  },

  // POSTS RELACIONADOS

  cardPost: {

    backgroundColor: '#121721',

    borderRadius: 14,

    padding: 14,

    borderWidth: 1,

    borderColor: '#1E2634',

    marginTop: 5,

  },

  headerPost: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 8,

  },

  avatarUsuario: {

    width: 32,

    height: 32,

    borderRadius: 16,

    backgroundColor: '#334155',

    marginRight: 10,

  },

  nomeUsuario: {

    color: '#E2E8F0',

    fontSize: 13,

    fontWeight: 'bold',

    flex: 1,

  },

  estrelasMinis: {

    flexDirection: 'row',

  },

  conteudoPost: {

    color: '#94A3B8',

    fontSize: 13,

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

 /*  // Estilo para o bloco de exibição
  blocoExibicao: {
    backgroundColor: '#121721',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E2634',
  },
  textoBloco: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 20, // Aumenta o espaçamento entre linhas para facilitar a leitura
  }, */

});
 
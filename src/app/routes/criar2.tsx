import { View, Text, TouchableOpacity, StyleSheet,TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function Criar2() {
  const router = useRouter();

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
});

import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="explorar" options={{ title: 'Explorar' }} />
      <Tabs.Screen name="criar" options={{ title: 'Criar' }} />
      <Tabs.Screen name="salvos" options={{ title: 'Salvos' }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}

import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import { Feather, Ionicons } from '@expo/vector-icons';

export function NavBar() {
  // 1. ADICIONE ESTA FUNÇÃO AQUI:
  const handlePress = (action: string) => {
    console.log(`Ação acionada: ${action}`);
  };

  return (
    /* BOTTOM NAVIGATION BAR (Visual apenas) */
    <View style={styles.tabBarContainer}>
      <TouchableOpacity style={styles.tabItem} onPress={() => handlePress('Tab Início')}>
        <Feather name="home" size={24} color="#94A3B8" />
        <Text style={styles.tabLabel}>Início</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.tabItem, styles.tabItemActive]} onPress={() => handlePress('Tab Explorar')}>
        <Feather name="music" size={24} color="#E2E8F0" />
        <Text style={[styles.tabLabel, styles.tabLabelActive]}>Explorar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => handlePress('Tab Criar')}>
        <Feather name="plus" size={24} color="#94A3B8" />
        <Text style={styles.tabLabel}>Criar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => handlePress('Tab Salvos')}>
        <Feather name="bookmark" size={24} color="#94A3B8" />
        <Text style={styles.tabLabel}>Salvos</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => handlePress('Tab Perfil')}>
        <Feather name="user" size={24} color="#94A3B8" />
        <Text style={styles.tabLabel}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
     tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    height: 80,
    paddingBottom: 25,
    paddingTop: 10,
    paddingHorizontal: 5,
    borderTopWidth: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginHorizontal: 5,
    height: 60,
  },
  tabItemActive: {
    backgroundColor: '#405B7A',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#E2E8F0',
  },
})
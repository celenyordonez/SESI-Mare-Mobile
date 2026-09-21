
import { Tabs } from 'expo-router';
import NavBar from '../../components/navBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <NavBar {...props} />}
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


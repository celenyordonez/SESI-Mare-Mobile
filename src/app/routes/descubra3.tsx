import React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function CriarContaInicial() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#080B10"
      />

      <LinearGradient
        colors={['#080B10', '#101A27', '#111D29']}
        locations={[0, 0.55, 1]}
        style={styles.gradient}
      >

        <View style={styles.logoContainer}>
          <Image
            source={require('../../src/app/assets/images/logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>


        <View style={styles.bottomContent}>

          <Text style={styles.title}>
            Crie sua conta e comece a{'\n'}explorar.
          </Text>


          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => router.push('/cadastro')}
          >
            <Text style={styles.createButtonText}>
              Criar conta
            </Text>
          </TouchableOpacity>

 
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginText}>
              Já tenho uma conta
            </Text>
          </TouchableOpacity>

        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080B10',
  },

  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  logoContainer: {
    position: 'absolute',
    top: height * 0.07,
    width: '100%',
    alignItems: 'center',
  },

  logo: {
    width: 95,
    height: 95,
  },

  bottomContent: {
    position: 'absolute',
    bottom: height * 0.075,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 35,
  },

  title: {
    color: '#F2F2F2',
    fontSize: 20,
    fontFamily: 'serif',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
  },

  createButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#5EA7ED',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'serif',
  },

  loginText: {
    color: '#D6D6D6',
    fontSize: 15,
    fontFamily: 'serif',
    textDecorationLine: 'underline',
  },
});
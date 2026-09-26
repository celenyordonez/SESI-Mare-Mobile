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
  Platform,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

const { height } = Dimensions.get('window');

export default function Onboarding2() {
  const router = useRouter();

  function pular() {
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#070B10"
      />

      <LinearGradient
        colors={[
          '#070B10',
          '#080D14',
          '#0C1723',
          '#14283B',
        ]}
        locations={[0, 0.35, 0.68, 1]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>


          <View style={styles.topArea}>

            <Image
              source={require('../../src/app/assets/images/logo1.png')}
              style={styles.logo}
              resizeMode="contain"
            />


            <View style={styles.indicadores}>

              <View style={styles.ponto} />

              <View
                style={[
                  styles.ponto,
                  styles.pontoAtivo,
                ]}
              />

              <View style={styles.ponto} />

            </View>
          </View>


          <View style={styles.textArea}>
            <Text style={styles.texto}>
              Compartilhe o que você está
            </Text>

            <Text style={styles.texto}>
              ouvindo.
            </Text>
          </View>


          <View style={styles.bottomArea}>


            <TouchableOpacity
              onPress={pular}
              activeOpacity={0.7}
              style={styles.skipButton}
            >
              <Text style={styles.skipText}>
                Skip
              </Text>
            </TouchableOpacity>


            <Link
              href="/descubra2"
              asChild
            >
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.nextButton}
              >
                <Ionicons
                  name="arrow-forward"
                  size={27}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </Link>

          </View>

        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({


  container: {
    flex: 1,
    backgroundColor: '#070B10',
  },

  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 22,
  },


  topArea: {
    position: 'relative',
    height: height * 0.32,
    alignItems: 'center',
    paddingTop: height * 0.045,
  },


  logo: {
    position: 'absolute',
    top: 63,
    width: 92,
    height: 92,
    zIndex: 5,
  },


  indicadores: {
    position: 'absolute',
    top: 161,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  ponto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#777F87',
  },

  pontoAtivo: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#55A9F3',
  },


  textArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: height * 0.745,
    alignItems: 'center',
  },

  texto: {
    color: '#F3F3F3',
    fontSize: 20,
    lineHeight: 27,
    textAlign: 'center',
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },


  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 23,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },

  skipButton: {
    height: 50,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },

  skipText: {
    color: '#D5D5D5',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
  },

  nextButton: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: '#58A9F2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    margin: 0,
  },
});
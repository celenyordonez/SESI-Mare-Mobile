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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Descubra() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1E1E1E"
      />

      <View style={styles.container}>

        <LinearGradient
          colors={['#070A0F', '#08111A', '#091722']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.background}
        >


          <Image
            source={require('../../src/app/assets/images/logo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />


          <View style={styles.indicators}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>


          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Descubra{'\n'}
              músicas que{'\n'}
              combinam com{'\n'}
              <Text style={styles.boldText}>
                você.
              </Text>
            </Text>
          </View>


          <Image
            source={require('../../src/app/assets/images/disco.png')}
            style={styles.disco}
            resizeMode="contain"
          />


          <TouchableOpacity
            style={styles.nextButton}
            activeOpacity={0.8}
            onPress={() => router.push('/descubra1')}
          >
            <Ionicons
              name="arrow-forward"
              size={30}
              color="#FFFFFF"
            />
          </TouchableOpacity>


          <TouchableOpacity
            style={styles.skipButton}
            activeOpacity={0.7}
            onPress={() => router.push('/descubra1')}
          >
            <Text style={styles.skipText}>
              Skip
            </Text>
          </TouchableOpacity>

        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({


  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },

  container: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#1E1E1E',
  },

  background: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },


  logo: {
    position: 'absolute',
    width: 71,
    height: 71,
    top: 52,
    left: '50%',
    marginLeft: -27.5,
    zIndex: 10,
  },


  indicators: {
    position: 'absolute',
    top: 126,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#596978',
  },

  activeDot: {
    width: 5,
    height: 5,
    backgroundColor: '#55A9F4',
  },


  textContainer: {
    position: 'absolute',
    top: 190,
    left: 32,
    width: width * 0.78,
    zIndex: 10,
  },

  title: {
    color: '#F5F5F5',
    fontSize: 32,
    lineHeight: 42,
    fontFamily: 'serif',
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  boldText: {
    fontWeight: '700',
  },


  disco: {
    position: 'absolute',
    width: 250,
    height: 500,
    right: -25,
    bottom: 15,
    zIndex: 1,
  },

 
  nextButton: {
    position: 'absolute',
    left: 32,
    bottom: 220,
    width: 61,
    height: 61,
    borderRadius: 50,
    backgroundColor: '#55A9F4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#55A9F4',


    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  skipButton: {
    position: 'absolute',
    left: 32,
    bottom: 30,
    paddingVertical: 10,
    paddingHorizontal: 2,
    zIndex: 20,
  },

  skipText: {
    color: '#E7E7E7',
    fontSize: 14,
    fontFamily: 'serif',
  },
});
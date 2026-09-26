import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';

export const options = {
  headerShown: false,
};

//Tela de cadastro
export default function CadastroScreen() {

  const router = useRouter();

  //State
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');


  //Botão criar conta
  const criarConta = () => {

    if (!usuario.trim()) {
      Alert.alert('Atenção', 'Digite seu usuário.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    if (!senha.trim()) {
      Alert.alert('Atenção', 'Digite sua senha.');
      return;
    }

    if (!confirmarSenha.trim()) {
      Alert.alert('Atenção', 'Confirme sua senha.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não são iguais.');
      return;
    }

    Alert.alert(
      'Cadastro realizado!',
      'Sua conta foi criada com sucesso.',
      [
        {
          text: 'OK',
          onPress: () => router.push('/login'),
        },
      ]
    );
  };


  //Termos de uso e política de privacidade
  const abrirTermos = () => {
    Alert.alert(
      'Termos de Uso',
      'Este é um texto ilustrativo de Termos de Uso para o projeto Maré.'
    );
  };


  const abrirPrivacidade = () => {
    Alert.alert(
      'Política de Privacidade',
      'Esta é uma Política de Privacidade ilustrativa para o projeto Maré.'
    );
  };

  //Interface
  return (
    <SafeAreaView style={styles.safeArea}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#080A10"
      />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >


          <LinearGradient
            colors={[
              '#080A10',
              '#0A0F18',
              '#111D2E',
              '#1C2E48',
            ]}
            locations={[0, 0.35, 0.7, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.container}
          >


            <View style={styles.logoContainer}>
              <Image
                source={require('./assets/images/logo1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>


            <Text style={styles.title}>
              Cadastro
            </Text>
            <Text style={styles.subtitle}>
              Crie sua conta agora e acesse todas músicas disponíveis.
            </Text>



            <View style={styles.form}>

              <Text style={styles.label}>
                Usuário
              </Text>

              <TextInput
                style={styles.input}
                value={usuario}
                onChangeText={setUsuario}
                placeholder="Usuário"
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
                selectionColor={COLORS.blue}
              />

              <Text style={styles.label}>
                E-mail
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                selectionColor={COLORS.blue}
              />


              <Text style={styles.label}>
                Senha
              </Text>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="Senha"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry
                selectionColor={COLORS.blue}
              />


              <Text style={styles.label}>
                Confirmar senha
              </Text>
              <TextInput
                style={styles.input}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                placeholder="Confirmar senha"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry
                selectionColor={COLORS.blue}
              />

            </View>



            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                Ao criar sua conta, você concorda com nossos{' '}
                <Text
                  style={styles.termsLink}
                  onPress={abrirTermos}
                >
                  Termos de Uso
                </Text>

                {' '}e{' '}

                <Text
                  style={styles.termsLink}
                  onPress={abrirPrivacidade}
                >
                  Política de Privacidade.
                </Text>
              </Text>
            </View>



            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={criarConta}
            >

              <Text style={styles.createButtonText}>
                Criar conta
              </Text>
            </TouchableOpacity>



            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                Já tem uma conta?{' '}
              </Text>

              <Link
                href="/login"
                style={styles.loginLink}
              >
                Entrar
              </Link>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const COLORS = {
  backgroundTop: '#080A10',
  backgroundBottom: '#1C2E48',
  inputBackground: '#0C121D',
  inputBorder: '#171E2B',
  text: '#FFFFFF',
  textSecondary: '#D0D0D5',
  placeholder: '#4B4B6B',
  blue: '#5EA7ED',
  link: '#72A8DD',
  terms: '#D0D0D5',
};



const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.backgroundTop,
  },

  keyboardContainer: {
    flex: 1,
    width: '100%',
  },

  scrollView: {
    flex: 1,
    width: '100%',
  },

  scrollContainer: {
    flexGrow: 1,
    width: '100%',
  },

  container: {
    width: '100%',
    minHeight: '100%',
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingTop: 38,
    paddingBottom: 28,
  },


  logoContainer: {
    width: '100%',
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  logo: {
    width: 200,
    height: 88,
  },


  title: {
    color: COLORS.text,
    fontSize: 24,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
    textAlign: 'center',
    marginTop: 2,
  },

  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 1,
    marginBottom: 35,
  },


  form: {
    width: '100%',
  },

  label: {
    color: '#EEEEF1',
    fontSize: 14,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
    marginLeft: 2,
    marginBottom: 5,
  },

  input: {
    width: '100%',
    height: 40,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 9,
    paddingHorizontal: 11,
    color: COLORS.text,
    fontSize: 13,
    marginBottom: 22,
  },


  termsContainer: {
    width: '100%',
    paddingHorizontal: 4,
    marginTop: -4,
    marginBottom: 25,
  },

  termsText: {
    color: COLORS.terms,
    fontSize: 12,
    lineHeight: 18,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
    textAlign: 'center',
  },

  termsLink: {
    color: COLORS.text,
    textDecorationLine: 'underline',
  },


  createButton: {
    width: '100%',
    height: 53,
    backgroundColor: COLORS.blue,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
  },


  loginContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },

  loginText: {
    color: '#D0D0D5',
    fontSize: 13,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
  },

  loginLink: {
    color: COLORS.link,
    fontSize: 13,
    fontFamily:
      Platform.OS === 'ios'
        ? 'Georgia'
        : 'serif',
    textDecorationLine: 'underline',
  },
});
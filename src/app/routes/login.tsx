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


// Tela de login
export default function LoginScreen() {

    const router = useRouter();


    // State
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');


    // Botão entrar
    const entrar = () => {

        if (!email.trim()) {
            Alert.alert('Atenção', 'Digite seu e-mail ou usuário.');
            return;
        }

        if (!senha.trim()) {
            Alert.alert('Atenção', 'Digite sua senha.');
            return;
        }

        router.push('/login');
    };


    // Botão redefinir senha
    const redefinirSenha = () => {

        Alert.alert(
            'Redefinir senha',
            'Um link para redefinir sua senha será enviado para o seu e-mail.'
        );

    };


    // Interface
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

                    {/* Gradiente */}

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

                        {/* Logo */}

                        <View style={styles.logoContainer}>

                            <Image
                                source={require('./assets/images/logo1.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />

                        </View>


                        {/* Título e subtítulo */}

                        <Text style={styles.title}>
                            Login
                        </Text>

                        <Text style={styles.subtitle}>
                            Bem-vindo de volta! Continue de onde você parou.
                        </Text>


                        {/* Campos */}

                        <View style={styles.form}>

                            <Text style={styles.label}>
                                E-mail ou Usuário
                            </Text>

                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="E-mail ou Usuário"
                                placeholderTextColor={COLORS.placeholder}
                                autoCapitalize="none"
                                keyboardType="email-address"
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

                        </View>


                        {/* Esqueci a senha */}

                        <View style={styles.forgotContainer}>

                            <Text style={styles.forgotText}>
                                Esqueceu a senha?{' '}
                            </Text>

                            <Text
                                style={styles.forgotLink}
                                onPress={redefinirSenha}
                            >
                                Redefinir senha
                            </Text>

                        </View>


                        {/* Botão entrar */}

                        <TouchableOpacity
                            style={styles.loginButton}
                            activeOpacity={0.8}
                            onPress={entrar}
                        >

                            <Text style={styles.loginButtonText}>
                                Entrar
                            </Text>

                        </TouchableOpacity>


                        {/* Criar conta */}

                        <View style={styles.registerContainer}>

                            <Text style={styles.registerText}>
                                Não tem uma conta?{' '}
                            </Text>

                            <Link
                                href="/cadastro"
                                style={styles.registerLink}
                            >
                                Criar
                            </Link>

                        </View>

                    </LinearGradient>

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
}


const COLORS = {
    inputBackground: '#080C14',
    inputBorder: '#171E2B',
    text: '#FFFFFF',
    textSecondary: '#D0D0D5',
    placeholder: '#4B4B6B',
    blue: '#5EA7ED',
    link: '#72A8DD',
};


const styles = StyleSheet.create({

    safeArea: {
        flex: 1,
        width: '100%',
        backgroundColor: '#080A10',
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
        paddingHorizontal: 28,
        paddingTop: 120,
        paddingBottom: 60,
    },


    logoContainer: {
        width: '100%',
        height: 92,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },

    logo: {
        width: 100,
        height: 100,
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
        marginTop: 2,
        marginBottom: 35,
    },


    form: {
        width: '100%',
    },

    label: {
        color: '#EEEEF1',
        fontSize: 13,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Georgia'
                : 'serif',
        marginLeft: 1,
        marginBottom: 6,
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
        marginBottom: 21,
    },


    forgotContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -5,
        marginBottom: 34,
        paddingLeft: 1,
    },

    forgotText: {
        color: '#D0D0D5',
        fontSize: 12,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Georgia'
                : 'serif',
    },

    forgotLink: {
        color: COLORS.link,
        fontSize: 12,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Georgia'
                : 'serif',
        textDecorationLine: 'underline',
    },


    loginButton: {
        width: '100%',
        height: 51,
        backgroundColor: COLORS.blue,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 35,
    },

    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 19,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Georgia'
                : 'serif',
    },


    registerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 0,
    },

    registerText: {
        color: '#D0D0D5',
        fontSize: 13,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Georgia'
                : 'serif',
    },

    registerLink: {
        color: COLORS.link,
        fontSize: 13,
        fontFamily:
            Platform.OS === 'ios'
                ? 'Georgia'
                : 'serif',
        textDecorationLine: 'underline',
    },

});
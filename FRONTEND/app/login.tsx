import { useAuth } from '@/hooks/use-auth';
import { authService, googleAuthService } from '@/services';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles/login-styles';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    googleAuthService.configure();
  }, []);

  const onLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      return Alert.alert('Missing Information', 'Please enter both phone number and password.');
    }

    clearError();

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+84' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('84')) {
        formattedPhone = '+84' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    const success = await login({
      phone: formattedPhone,
      password: password.trim(),
    });

    if (success) {
      router.replace('/home');
    } else {
      Alert.alert('Login Error', error || 'Incorrect phone number or password');
    }
  };

  const onSignUp = () => {
    router.push('/signup');
  };

  const onLoginWithGoogle = async () => {
    try {
      setIsGoogleLoading(true);
      clearError();

      const idToken = await googleAuthService.signIn();

      const authResponse = await authService.loginWithGoogle(idToken);

      if (authResponse && authResponse.user) {
        Alert.alert('Success', `Welcome ${authResponse.user.name}!`, [
          {
            text: 'OK',
            onPress: () => router.replace('/home'),
          },
        ]);
      }
    } catch (err: any) {
      console.error('Google Login Error:', err);
      Alert.alert(
        'Google Sign-In Error',
        err.message || 'Unable to sign in with Google. Please try again.'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.bg}
        imageStyle={{ resizeMode: 'cover', opacity: 0.9 }}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.logoWrap}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>LOG IN</Text>
              <Text style={styles.subtitle}>Welcome back!</Text>

              <View style={styles.inputRow}>
                <FontAwesome name="phone" size={18} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number (0987654321)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && { opacity: 0.6 }]}
                onPress={onLogin}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Logging in...' : 'LOG IN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={onSignUp}>
                <Text style={styles.linkButtonText}>Don't have an account? Sign up</Text>
              </TouchableOpacity>

              <View style={styles.orDivider}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              <TouchableOpacity
                style={[styles.googleButton, (isGoogleLoading || isLoading) && { opacity: 0.6 }]}
                onPress={onLoginWithGoogle}
                disabled={isGoogleLoading || isLoading}
              >
                <FontAwesome5 name="google" size={18} color="#DB4437" style={{ marginRight: 8 }} />
                <Text style={styles.googleButtonText}>
                  {isGoogleLoading ? 'Processing...' : 'Continue with Google'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

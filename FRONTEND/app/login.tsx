import { useAuth } from '@/hooks/use-auth';
import { authService, googleAuthService } from '@/services';
import { FontAwesome, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Colors, Spacings, Image, LoaderScreen } from 'react-native-ui-lib';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
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
    <View flex bg-white>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&q=80&w=1000' }}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View absF bg-black style={{ opacity: 0.5 }} />

        <View padding-30 style={{ borderTopLeftRadius: 35, borderTopRightRadius: 35, backgroundColor: Colors.white }}>
          <View marginB-35 centerH>
            <View
              width={60}
              height={60}
              center
              br100
              bg-primaryColor
              marginB-15
              style={{ elevation: 8, shadowColor: Colors.primaryColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
            >
              <FontAwesome5 name="motorcycle" size={28} color={Colors.white} />
            </View>
            <Text text50 primaryColor style={{ fontWeight: 'bold', letterSpacing: 0.5 }}>MotorSpa</Text>
            <Text text80 textSecondary marginT-8 center>
              Your trusted motorcycle care partner
            </Text>
          </View>

          <View>
            <View
              row
              centerV
              marginB-18
              paddingH-18
              paddingV-4
              style={{
                height: 58,
                borderRadius: 20,
                backgroundColor: Colors.grey80,
                borderWidth: 1.5,
                borderColor: 'transparent'
              }}
            >
              <FontAwesome name="phone" size={20} color={Colors.primaryColor} style={{ marginRight: 15 }} />
              <TextInput
                style={{ flex: 1, fontSize: 16, color: Colors.textColor, fontWeight: '500' }}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                placeholderTextColor={Colors.grey40}
              />
            </View>

            <View
              row
              centerV
              marginB-28
              paddingH-18
              paddingV-4
              style={{
                height: 58,
                borderRadius: 20,
                backgroundColor: Colors.grey80,
                borderWidth: 1.5,
                borderColor: 'transparent'
              }}
            >
              <MaterialIcons name="lock-outline" size={22} color={Colors.primaryColor} style={{ marginRight: 15 }} />
              <TextInput
                style={{ flex: 1, fontSize: 16, color: Colors.textColor, fontWeight: '500' }}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={Colors.grey40}
              />
            </View>

            <Button
              label={isLoading ? "Logging in..." : "LOG IN"}
              onPress={onLogin}
              backgroundColor={Colors.primaryColor}
              disabled={isLoading}
              marginB-12
              style={{ height: 58, borderRadius: 20 }}
              labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1 }}
              enableShadow
            />

            <Button
              label="Sign up for a new account"
              link
              color={Colors.primaryColor}
              onPress={onSignUp}
              marginB-28
              center
              labelStyle={{ fontSize: 15, fontWeight: '600' }}
            />

            <View row centerV marginB-28>
              <View flex height={1.5} bg-grey60 style={{ borderRadius: 1 }} />
              <Text text80 marginH-15 grey30 style={{ fontWeight: '600' }}>OR</Text>
              <View flex height={1.5} bg-grey60 style={{ borderRadius: 1 }} />
            </View>

            <Button
              label={isGoogleLoading ? "Processing..." : "Continue with Google"}
              onPress={onLoginWithGoogle}
              backgroundColor={Colors.white}
              outline
              outlineColor={Colors.grey50}
              outlineWidth={1.5}
              color={Colors.textColor}
              disabled={isGoogleLoading || isLoading}
              marginB-20
              style={{ height: 58, borderRadius: 20 }}
              labelStyle={{ fontSize: 15, fontWeight: '600' }}
              iconSource={() => <FontAwesome5 name="google" size={20} color="#DB4437" style={{ marginRight: 12 }} />}
            />
          </View>

          <Text text90 center grey40 marginT-10 style={{ lineHeight: 18 }}>
            By continuing, you agree to our{'\n'}Terms & Conditions
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

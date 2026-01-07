import { useAuth } from '@/hooks/use-auth';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles/signup-styles';

const COUNTRIES = [
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+82', name: 'Korea', flag: '🇰🇷' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
];

export default function SignUpScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  
  const [countryCode, setCountryCode] = useState('+84');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  const validate = () => {
    if (!name.trim() || !phone.trim() || !password.trim() || !confirmPwd.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return false;
    }
    
    if (email.trim()) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return false;
      }
    }
    
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return false;
    }
    
    if (password !== confirmPwd) {
      Alert.alert('Password Confirmation', 'Password and confirmation do not match.');
      return false;
    }
    
    return true;
  };

  const onSignUp = async () => {
    if (!validate()) return;
    
    clearError();
    
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = formattedPhone.substring(1);
    }
    formattedPhone = countryCode + formattedPhone;
    
    const success = await register({
      name: name.trim(),
      phone: formattedPhone,
      password: password.trim(),
      email: email.trim() || undefined,
    });
    
    if (success) {
      Alert.alert('Success', 'Registration successful! Please login.', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    } else {
      Alert.alert('Registration Error', error || 'Registration failed');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ImageBackground
        source={require('../assets/images/background.png')}
        style={styles.bg}
        imageStyle={{ resizeMode: 'cover', opacity: 0.9 }}
      >
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.logoWrap}>
              <Image source={require('../assets/images/logo.png')} style={styles.logo} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>SIGN UP</Text>
              <Text style={styles.cardSub}>Please enter your information</Text>

              <View style={styles.inputRow}>
                <FontAwesome5 name="user" size={16} style={styles.icon} />
                <TextInput 
                  placeholder="Full Name *" 
                  placeholderTextColor="#9aa0a6" 
                  style={styles.input} 
                  value={name} 
                  onChangeText={setName} 
                />
              </View>

              <View style={styles.inputRow}>
                <FontAwesome5 name="phone" size={16} style={styles.icon} />
                <TouchableOpacity 
                  style={styles.countryCodeBox}
                  onPress={() => setShowCountryPicker(true)}
                >
                  <Text style={styles.countryCodeText}>{countryCode}</Text>
                  <MaterialIcons name="arrow-drop-down" size={20} color="#666" />
                </TouchableOpacity>
                <TextInput 
                  placeholder="987654321" 
                  placeholderTextColor="#9aa0a6" 
                  style={styles.input} 
                  value={phone} 
                  onChangeText={setPhone} 
                  keyboardType="phone-pad" 
                />
              </View>

              <View style={styles.inputRow}>
                <FontAwesome5 name="envelope" size={16} style={styles.icon} />
                <TextInput 
                  placeholder="Email (optional)" 
                  placeholderTextColor="#9aa0a6" 
                  style={styles.input} 
                  value={email} 
                  onChangeText={setEmail} 
                  keyboardType="email-address" 
                />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={18} style={styles.icon} />
                <TextInput placeholder="Password" placeholderTextColor="#9aa0a6" secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
              </View>

              <View style={styles.inputRow}>
                <MaterialIcons name="lock-outline" size={18} style={styles.icon} />
                <TextInput placeholder="Confirm Password" placeholderTextColor="#9aa0a6" secureTextEntry style={styles.input} value={confirmPwd} onChangeText={setConfirmPwd} />
              </View>

              <TouchableOpacity 
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]} 
                onPress={onSignUp} 
                activeOpacity={0.85} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>SIGN UP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.footerLink} onPress={() => router.push('/login')}>
                <Text style={styles.footerLinkText}>I already have an account...</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    countryCode === country.code && styles.countryItemSelected
                  ]}
                  onPress={() => {
                    setCountryCode(country.code);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryCodeInList}>{country.code}</Text>
                  {countryCode === country.code && (
                    <MaterialIcons name="check" size={20} color="#2466ca" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

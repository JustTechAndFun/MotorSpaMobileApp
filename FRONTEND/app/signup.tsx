import { useAuth } from '@/hooks/use-auth';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Button, Colors, Card } from 'react-native-ui-lib';
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
    <View flex bg-white>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000' }}
          style={{ flex: 1 }}
        >
          <View absF bg-black style={{ opacity: 0.5 }} />

          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Header */}
              <View padding-25 centerH marginT-20>
                <View
                  width={70}
                  height={70}
                  center
                  br100
                  bg-white
                  marginB-20
                  style={{
                    elevation: 10,
                    shadowColor: Colors.primaryColor,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.25,
                    shadowRadius: 10
                  }}
                >
                  <FontAwesome5 name="motorcycle" size={32} color={Colors.primaryColor} />
                </View>
                <Text text40 white style={{ fontWeight: 'bold', letterSpacing: 1 }}>Create Account</Text>
                <Text text80 white marginT-8 center style={{ opacity: 0.9 }}>
                  Join MotorSpa today
                </Text>
              </View>

              {/* Form Card */}
              <Card
                margin-20
                padding-25
                br40
                bg-white
                enableShadow
                style={{ elevation: 8 }}
              >
                {/* Name Input */}
                <View marginB-15>
                  <Text text80 textColor marginB-8 style={{ fontWeight: '600' }}>Full Name *</Text>
                  <View
                    row
                    centerV
                    paddingH-18
                    paddingV-4
                    style={{
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: Colors.grey80,
                      borderWidth: 1.5,
                      borderColor: 'transparent'
                    }}
                  >
                    <FontAwesome5 name="user" size={18} color={Colors.primaryColor} style={{ marginRight: 15 }} />
                    <TextInput
                      placeholder="Enter your full name"
                      placeholderTextColor={Colors.grey40}
                      style={{ flex: 1, fontSize: 15, color: Colors.textColor, fontWeight: '500' }}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                {/* Phone Input */}
                <View marginB-15>
                  <Text text80 textColor marginB-8 style={{ fontWeight: '600' }}>Phone Number *</Text>
                  <View
                    row
                    centerV
                    paddingH-18
                    paddingV-4
                    style={{
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: Colors.grey80,
                      borderWidth: 1.5,
                      borderColor: 'transparent'
                    }}
                  >
                    <FontAwesome5 name="phone" size={18} color={Colors.primaryColor} style={{ marginRight: 15 }} />
                    <TouchableOpacity
                      onPress={() => setShowCountryPicker(true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingRight: 12,
                        borderRightWidth: 1.5,
                        borderRightColor: Colors.grey60,
                        marginRight: 12
                      }}
                    >
                      <Text text70 textColor style={{ fontWeight: '600', marginRight: 4 }}>{countryCode}</Text>
                      <MaterialIcons name="arrow-drop-down" size={22} color={Colors.grey30} />
                    </TouchableOpacity>
                    <TextInput
                      placeholder="987654321"
                      placeholderTextColor={Colors.grey40}
                      style={{ flex: 1, fontSize: 15, color: Colors.textColor, fontWeight: '500' }}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View marginB-15>
                  <Text text80 textColor marginB-8 style={{ fontWeight: '600' }}>Email (Optional)</Text>
                  <View
                    row
                    centerV
                    paddingH-18
                    paddingV-4
                    style={{
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: Colors.grey80,
                      borderWidth: 1.5,
                      borderColor: 'transparent'
                    }}
                  >
                    <FontAwesome5 name="envelope" size={16} color={Colors.primaryColor} style={{ marginRight: 15 }} />
                    <TextInput
                      placeholder="your.email@example.com"
                      placeholderTextColor={Colors.grey40}
                      style={{ flex: 1, fontSize: 15, color: Colors.textColor, fontWeight: '500' }}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View marginB-15>
                  <Text text80 textColor marginB-8 style={{ fontWeight: '600' }}>Password *</Text>
                  <View
                    row
                    centerV
                    paddingH-18
                    paddingV-4
                    style={{
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: Colors.grey80,
                      borderWidth: 1.5,
                      borderColor: 'transparent'
                    }}
                  >
                    <MaterialIcons name="lock-outline" size={20} color={Colors.primaryColor} style={{ marginRight: 15 }} />
                    <TextInput
                      placeholder="Minimum 6 characters"
                      placeholderTextColor={Colors.grey40}
                      secureTextEntry
                      style={{ flex: 1, fontSize: 15, color: Colors.textColor, fontWeight: '500' }}
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View marginB-25>
                  <Text text80 textColor marginB-8 style={{ fontWeight: '600' }}>Confirm Password *</Text>
                  <View
                    row
                    centerV
                    paddingH-18
                    paddingV-4
                    style={{
                      height: 56,
                      borderRadius: 18,
                      backgroundColor: Colors.grey80,
                      borderWidth: 1.5,
                      borderColor: 'transparent'
                    }}
                  >
                    <MaterialIcons name="lock-outline" size={20} color={Colors.primaryColor} style={{ marginRight: 15 }} />
                    <TextInput
                      placeholder="Re-enter password"
                      placeholderTextColor={Colors.grey40}
                      secureTextEntry
                      style={{ flex: 1, fontSize: 15, color: Colors.textColor, fontWeight: '500' }}
                      value={confirmPwd}
                      onChangeText={setConfirmPwd}
                    />
                  </View>
                </View>

                {/* Sign Up Button */}
                <Button
                  label={isLoading ? "Creating Account..." : "SIGN UP"}
                  onPress={onSignUp}
                  backgroundColor={Colors.primaryColor}
                  disabled={isLoading}
                  marginB-18
                  style={{ height: 58, borderRadius: 18 }}
                  labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 1.2 }}
                  enableShadow
                />

                {/* Login Link */}
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text text80 center primaryColor style={{ fontWeight: '600' }}>
                    Already have an account? <Text style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}>Log In</Text>
                  </Text>
                </TouchableOpacity>
              </Card>

              <Text text90 center white marginT-15 marginH-30 style={{ lineHeight: 20, opacity: 0.85 }}>
                By signing up, you agree to our{'\n'}Terms of Service & Privacy Policy
              </Text>
            </ScrollView>
          </SafeAreaView>
        </ImageBackground>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View
            style={{
              backgroundColor: Colors.white,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              maxHeight: '70%'
            }}
            onStartShouldSetResponder={() => true}
          >
            <View
              row
              spread
              centerV
              padding-20
              style={{
                borderBottomWidth: 1.5,
                borderBottomColor: Colors.grey70
              }}
            >
              <Text text60 textColor style={{ fontWeight: 'bold' }}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <MaterialIcons name="close" size={26} color={Colors.grey20} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  onPress={() => {
                    setCountryCode(country.code);
                    setShowCountryPicker(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    backgroundColor: countryCode === country.code ? Colors.grey80 : 'transparent'
                  }}
                >
                  <Text style={{ fontSize: 28, marginRight: 15 }}>{country.flag}</Text>
                  <Text text70 textColor style={{ flex: 1, fontWeight: '500' }}>{country.name}</Text>
                  <Text text70 grey30 marginR-10 style={{ fontWeight: '600' }}>{country.code}</Text>
                  {countryCode === country.code && (
                    <MaterialIcons name="check-circle" size={24} color={Colors.primaryColor} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

import { useAuth } from '@/hooks/use-auth';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { View, Text, Colors, Spacings, Image, Button, TouchableOpacity as UILibTouchableOpacity } from 'react-native-ui-lib';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavigator from '../components/bottom-navigator';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from '../styles/profile-styles';

let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, logout, updateProfile, isLoading } = useAuth();
  const [mode, setMode] = useState<'account' | 'edit'>('account');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const user = authUser || {
    id: '',
    phone: '',
    name: 'Guest User',
    email: null,
    role: 'customer',
    googleId: null,
    picture: null,
    createdAt: '',
    updatedAt: '',
  };

  const renderMenuItem = (icon: string, label: string, onPress: () => void, isDestructive = false) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 20,
        backgroundColor: Colors.white,
        borderRadius: 18,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4
      }}
    >
      <View row centerV>
        <View
          width={50}
          height={50}
          style={{
            borderRadius: 16,
            backgroundColor: isDestructive ? '#FEE2E2' : '#EEF2FF',
          }}
          center
          marginR-16
        >
          <Ionicons name={icon as any} size={26} color={isDestructive ? Colors.red30 : Colors.primaryColor} />
        </View>
        <Text text70 color={isDestructive ? Colors.red30 : Colors.textColor} style={{ fontWeight: '600' }}>{label}</Text>
      </View>
      <View
        width={32}
        height={32}
        center
        style={{
          backgroundColor: Colors.grey80,
          borderRadius: 10
        }}
      >
        <Ionicons name="chevron-forward" size={20} color={Colors.grey30} />
      </View>
    </TouchableOpacity>
  );

  return mode === 'account' ? (
    <View flex bg-grey80>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Section */}
        <View
          paddingH-20
          paddingT-60
          paddingB-30
          bg-white
          style={{
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 5
          }}
        >
          <View row centerV marginB-30>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: Colors.grey80,
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
            </TouchableOpacity>
            <Text text40 marginL-15 textColor style={{ fontWeight: 'bold' }}>Profile</Text>
          </View>

          {/* Avatar Section - Premium Design */}
          <View center marginT-10>
            <View style={{ position: 'relative', height: 150 }}>
              {/* Outer Ring */}
              <View
                width={150}
                height={150}
                br100
                center
                style={{
                  backgroundColor: Colors.grey80,
                  padding: 3
                }}
              >
                {user.picture ? (
                  <Image
                    source={{ uri: user.picture }}
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 52,
                      borderWidth: 4,
                      borderColor: Colors.white
                    }}
                  />
                ) : (
                  <View
                    // width={150}
                    // height={150}
                    br100
                    center
                    style={{
                      backgroundColor: Colors.primaryColor,
                      borderWidth: 4,
                      borderColor: Colors.white,
                      shadowColor: Colors.primaryColor,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 8
                    }}
                  >
                    <Ionicons name="person" size={100} color={Colors.white} />

                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        right: -10,
                        bottom: -10,
                        backgroundColor: Colors.primaryColor,
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        borderWidth: 4,
                        borderColor: Colors.white,
                        justifyContent: 'center',
                        alignItems: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        elevation: 6
                      }}
                      onPress={() => setMode('edit')}
                    >
                      <Ionicons name="pencil" size={17} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Edit Button - Bottom Right Position */}

            </View>

            {/* User Info - Centered */}
            <View center marginT-20>
              <Text text40 textColor center style={{ fontWeight: 'bold', letterSpacing: 0.3 }}>
                {user.name}
              </Text>
              <View
                row
                centerV
                marginT-8
                paddingH-16
                paddingV-8
                style={{
                  backgroundColor: Colors.grey80,
                  borderRadius: 20
                }}
              >
                <Ionicons name="call-outline" size={16} color={Colors.grey30} />
                <Text text80 grey30 marginL-8 style={{ fontWeight: '600' }}>
                  {user.phone || 'No phone number'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View padding-20 paddingT-25>
          <Text text80 grey40 marginB-16 marginL-5 style={{ letterSpacing: 1.2, fontWeight: '700' }}>GENERAL</Text>
          {renderMenuItem('receipt-outline', 'My Orders', () => router.push('/orders'))}
          {renderMenuItem('calendar-outline', 'My Bookings', () => router.push('/my-bookings'))}
          {renderMenuItem('location-outline', 'Shipping Address', () => router.push('/setting-location'))}
          {renderMenuItem('card-outline', 'Payment Settings', () => router.push('/setting-payment'))}

          <Text text80 grey40 marginB-16 marginT-25 marginL-5 style={{ letterSpacing: 1.2, fontWeight: '700' }}>SECURITY</Text>
          {renderMenuItem('lock-closed-outline', 'Password Settings', () => router.push('/change-password'))}
          {renderMenuItem('help-circle-outline', 'Help Center', () => router.push('/help'))}

          {user.role === 'admin' && (
            <>
              <Text text80 grey40 marginB-16 marginT-25 marginL-5 style={{ letterSpacing: 1.2, fontWeight: '700' }}>ADMINISTRATION</Text>
              {renderMenuItem('people-outline', 'User Management', () => router.push('/admin/user-management'))}
              {renderMenuItem('apps-outline', 'Category Management', () => router.push('/admin/category-management'))}
              {renderMenuItem('cube-outline', 'Product Management', () => router.push('/admin/product-management'))}
              {renderMenuItem('construct-outline', 'Service Management', () => router.push('/admin/service-management'))}
              {renderMenuItem('location-outline', 'Location Management', () => router.push('/admin/location-management'))}
              {renderMenuItem('receipt-outline', 'Order Management', () => router.push('/admin/order-management'))}
              {renderMenuItem('calendar-outline', 'Booking Management', () => router.push('/admin/booking-management'))}
              {renderMenuItem('chatbubble-outline', 'Q&A Management', () => router.push('/admin/qna-management'))}
            </>
          )}

          <TouchableOpacity
            marginT-35
            onPress={() => setShowLogoutModal(true)}
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 18,
              borderRadius: 18,
              backgroundColor: '#FFF1F2',
              shadowColor: Colors.red30,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 3
            }}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.red30} style={{ marginRight: 10 }} />
            <Text text70 red30 style={{ fontWeight: 'bold' }}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View flex center style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View
            width="88%"
            padding-28
            bg-white
            style={{
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10
            }}
          >
            <View
              width={70}
              height={70}
              center
              br100
              marginB-20
              style={{
                backgroundColor: '#FEE2E2',
                alignSelf: 'center'
              }}
            >
              <Ionicons name="log-out-outline" size={36} color={Colors.red30} />
            </View>
            <Text text40 textColor center style={{ fontWeight: 'bold' }}>Logout</Text>
            <Text text70 grey40 center marginV-20 style={{ lineHeight: 24 }}>
              Are you sure you want to log out of your account?
            </Text>
            <View row spread marginT-10>
              <Button
                flex
                marginR-10
                label="Cancel"
                outline
                outlineColor={Colors.grey50}
                color={Colors.grey30}
                onPress={() => setShowLogoutModal(false)}
                style={{ height: 54, borderRadius: 16 }}
                labelStyle={{ fontWeight: '600', fontSize: 15 }}
              />
              <Button
                flex
                label="Logout"
                backgroundColor={Colors.red30}
                onPress={async () => {
                  setShowLogoutModal(false);
                  await logout();
                  router.replace('/login');
                }}
                style={{ height: 54, borderRadius: 16 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                enableShadow
              />
            </View>
          </View>
        </View>
      </Modal>

      <View absB absL absR>
        <BottomNavigator activeTab="profile" />
      </View>
    </View>
  ) : (
    <EditProfile
      onBack={() => setMode('account')}
      user={user}
      onSave={updateProfile}
      isSaving={isLoading}
    />
  );
}

function EditProfile({ onBack, user, onSave, isSaving }: {
  onBack: () => void;
  user: any;
  onSave: (data: { name?: string; email?: string }) => Promise<boolean>;
  isSaving: boolean;
}) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [gender, setGender] = useState('Male');

  const toDate = (s?: string) => {
    if (!s) return new Date();
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date() : d;
  };
  const [birthdate, setBirthdate] = useState<Date>(toDate(user.createdAt));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('Name cannot be empty.');
      } else {
        Alert.alert('Validation', 'Name cannot be empty.');
      }
      return;
    }

    const success = await onSave({
      name: name.trim(),
      email: email?.trim() || undefined
    });

    if (success) {
      if (Platform.OS === 'web') {
        alert('Your profile has been updated.');
      } else {
        Alert.alert('Success', 'Your profile has been updated.');
      }
      onBack();
    } else {
      if (Platform.OS === 'web') {
        alert('Failed to update profile. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5EC' }} edges={['top']}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <FontAwesome5 name="arrow-left" size={18} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.editCard}>
        <TouchableOpacity style={styles.avatarUpload}>
          {user.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatarLarge} />
          ) : (
            <Image source={require('../assets/images/avatar.jpg')} style={styles.avatarLarge} />
          )}
          <Text style={styles.uploadText}>Change Photo</Text>
        </TouchableOpacity>

        <View style={styles.field}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={false}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setGender('Male')} style={[styles.radio, { marginRight: 12 }]}>
              <Text>{gender === 'Male' ? '☑' : '☐'} Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('Female')} style={styles.radio}>
              <Text>{gender === 'Female' ? '☑' : '☐'} Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Birthdate</Text>

          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={formatDate(birthdate)}
              onChange={(e: any) => {
                const d = new Date(e.target.value);
                if (!isNaN(d.getTime())) setBirthdate(d);
              }}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 8,
                borderWidth: 0,
                backgroundColor: '#f7f7f7',
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowDatePicker(true)}
                style={[styles.input, { justifyContent: 'center' }]}
              >
                <Text>{formatDate(birthdate)}</Text>
              </TouchableOpacity>

              {showDatePicker && DateTimePicker && (
                <DateTimePicker
                  value={birthdate}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  maximumDate={new Date()}
                  onChange={(_event: any, selected: Date | undefined) => {
                    setShowDatePicker(false);
                    if (selected) setBirthdate(selected);
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={[styles.field, { alignItems: 'center' }]}>
          <Text style={styles.label}>Social Accounts</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity accessibilityLabel="Google" style={{ marginRight: 16 }}>
              <FontAwesome5 name="google" size={20} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityLabel="Facebook">
              <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>SAVE</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
    </SafeAreaView>
  );
}

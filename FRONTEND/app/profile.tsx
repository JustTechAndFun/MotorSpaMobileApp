import { useAuth } from '@/hooks/use-auth';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import BottomNavigator from '../components/bottom-navigator';
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

  return mode === 'account' ? (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }} edges={['top']}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.screen} contentContainerStyle={[styles.container, { paddingBottom: 100 }]}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <FontAwesome5 name="arrow-left" size={18} color="#333" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Account Settings</Text>
          </View>

      <View style={styles.profileCard}>
        {user.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        ) : (
          <Image source={require('../assets/images/avatar.jpg')} style={styles.avatar} />
        )}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.userHandle}>{user.phone || 'No phone'}</Text>
          <Text style={styles.userName}>{user.name}</Text>
          <TouchableOpacity style={styles.linkBtn} onPress={() => setMode('edit')}>
            <Text style={styles.linkText}>Edit profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/orders')}
        >
          <Text style={styles.optText}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/my-bookings')}
        >
          <Text style={styles.optText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/setting-location')}
        >
          <Text style={styles.optText}>Shipping Address</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/setting-payment')}
        >
          <Text style={styles.optText}>Payment Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option}>
          <Text style={styles.optText}>Bank / Card</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity 
          style={styles.option}
          onPress={() => router.push('/change-password')}
        >
          <Text style={styles.optText}>Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Others</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => {
            router.push('/help');
          }}
        >
          <Text style={styles.optText}>Help Center</Text>
        </TouchableOpacity>
      </View>

      {/* Admin Section - Only visible for admin users */}
      {user.role === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin</Text>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => router.push('/admin/user-management')}
          >
            <FontAwesome5 name="users-cog" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>User Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/order-management')}
          >
            <FontAwesome5 name="receipt" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>Order Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/booking-management')}
          >
            <FontAwesome5 name="calendar-check" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>Booking Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/location-management')}
          >
            <FontAwesome5 name="map-marker-alt" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>Location Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/qna-management')}
          >
            <FontAwesome5 name="comments" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>QnA Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/product-management')}
          >
            <FontAwesome5 name="box" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>Product Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/service-management')}
          >
            <FontAwesome5 name="tools" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>Service Management</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.adminButton, { marginTop: 3 }]}
            onPress={() => router.push('/admin/category-management')}
          >
            <FontAwesome5 name="folder-open" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.adminButtonText}>Category Management</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.logoutBtn, isLoading && styles.logoutBtnDisabled]} 
        onPress={() => setShowLogoutModal(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.logoutText}>LOG OUT</Text>
        )}
      </TouchableOpacity>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  setShowLogoutModal(false);
                  try {
                    await logout();
                    router.replace('/login');
                  } catch (error: any) {
                    if (Platform.OS === 'web') {
                      alert(error.message || 'Log out failed');
                    } else {
                      Alert.alert('Error', error.message || 'Log out failed');
                    }
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 24 }} />
        </ScrollView>

        {/* Bottom Navigator */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <BottomNavigator activeTab="profile" />
        </View>
      </View>
    </SafeAreaView>
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
  );
}

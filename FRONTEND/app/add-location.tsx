import MapPicker from '@/components/map-picker';
import { addressService } from '@/services';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../styles/add-location-styles';

export default function AddLocationPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    isDefault: false,
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên người nhận');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }

    if (!formData.latitude || !formData.longitude || !formData.address) {
      Alert.alert('Lỗi', 'Vui lòng chọn vị trí trên bản đồ');
      return;
    }

    try {
      setIsLoading(true);
      
      const requestData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
        isDefault: formData.isDefault,
      };
      
      if (__DEV__) {
        console.log('📍 Sending address data:', requestData);
      }
      
      await addressService.createAddress(requestData);
      
      router.back();
      
      setTimeout(() => {
        Alert.alert('Thành công', 'Đã thêm địa chỉ mới!');
      }, 300);
    } catch (error: any) {
      console.error('Create address error:', error);
      
      if (error.message && !error.message.includes('Phiên đăng nhập hết hạn')) {
        Alert.alert('Lỗi', error.message || 'Không thể thêm địa chỉ. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Recipient Name */}
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="person-circle" size={24} color="#4A7C59" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Recipient Name"
              placeholderTextColor="#999"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="call" size={24} color="#4A7C59" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({...formData, phone: text})}
            />
          </View>

          {/* Select on Map Button */}
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => setMapVisible(true)}
          >
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.mapButtonText}>
              {formData.address ? 'Change Location' : 'Select Location on Map'}
            </Text>
          </TouchableOpacity>

          {/* Selected Address Display (Read-only) */}
          {formData.address && (
            <View style={styles.selectedAddressContainer}>
              <View style={styles.selectedAddressHeader}>
                <Ionicons name="checkmark-circle" size={20} color="#82b440" />
                <Text style={styles.selectedAddressTitle}>Selected Location</Text>
              </View>
              <Text style={styles.selectedAddressText}>{formData.address}</Text>
            </View>
          )}

          {/* Set as Default */}
          <TouchableOpacity 
            style={styles.checkboxRow}
            onPress={() => setFormData({...formData, isDefault: !formData.isDefault})}
          >
            <Ionicons 
              name={formData.isDefault ? "checkbox" : "square-outline"} 
              size={24} 
              color="#4A7C59" 
            />
            <Text style={styles.checkboxLabel}>Set as default address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>CONFIRM</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Picker Modal */}
      <MapPicker
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        onSelectLocation={(location) => {
          setFormData({
            ...formData,
            address: location.address || formData.address,
            latitude: location.latitude,
            longitude: location.longitude,
          });
          setMapVisible(false);
        }}
        initialLocation={
          formData.latitude && formData.longitude
            ? {
                latitude: formData.latitude,
                longitude: formData.longitude,
                address: formData.address,
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}

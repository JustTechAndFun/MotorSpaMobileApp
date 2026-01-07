import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { bookingService, locationService } from '../services';
import { styles } from '../styles/booking-styles';
import { BookingService, MotorService, StoreLocation } from '../types/api.types';

let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  DateTimePicker = require('@react-native-community/datetimepicker').default;
}

interface SelectedService extends BookingService {
  service: MotorService;
}

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ services?: string }>();
  
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<StoreLocation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [showPickerMode, setShowPickerMode] = useState<null | 'date' | 'time'>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.services) {
      try {
        const parsed = JSON.parse(decodeURIComponent(params.services));
        setSelectedServices(parsed);
      } catch (error) {
        console.error('Error parsing services:', error);
        Alert.alert('Lỗi', 'Không thể tải thông tin dịch vụ');
        router.back();
      }
    } else {
      router.replace('/select-service');
    }

    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getActiveLocations();
      setLocations(data);
      
      if (data.length > 0) {
        setSelectedLocation(data[0]);
      }
    } catch (error: any) {
      console.error('Error loading locations:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = (): number => {
    return selectedServices.reduce((sum, s) => {
      const price = s.service.discountPercentage > 0
        ? s.service.price * (1 - s.service.discountPercentage / 100)
        : s.service.price;
      return sum + (price * s.quantity);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedLocation) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn địa chỉ');
      return;
    }
    if (!date) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ngày');
      return;
    }
    if (!time) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn giờ');
      return;
    }

    try {
      setSubmitting(true);

      const bookingDateTime = new Date(date);
      bookingDateTime.setHours(time.getHours());
      bookingDateTime.setMinutes(time.getMinutes());

      const bookingData = {
        locationId: selectedLocation.id.toString(),
        bookingDate: bookingDateTime.toISOString(),
        services: selectedServices.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          notes: s.notes,
        })),
        notes: notes || undefined,
      };

      await bookingService.createBooking(bookingData);

      Alert.alert(
        'Thành công',
        'Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/my-bookings'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating booking:', error);
      const message = error?.response?.data?.message || 'Không thể tạo booking';
      Alert.alert('Lỗi', message);
    } finally {
      setSubmitting(false);
    }
  };

  const onNativeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPickerMode(null);
    }
    if (event.type === 'dismissed') {
      setShowPickerMode(null);
      return;
    }
    if (selectedDate) {
      if (showPickerMode === 'date') {
        setDate(selectedDate);
      } else if (showPickerMode === 'time') {
        setTime(selectedDate);
      }
      if (Platform.OS === 'ios') {
      } else {
        setShowPickerMode(null);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#82b440" />
        <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Đặt lịch dịch vụ</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Selected Services */}
        <View style={styles.card}>
          <View style={styles.serviceHeader}>
            <Text style={styles.label}>Dịch vụ đã chọn</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: '#82b440', fontSize: 14 }}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          
          {selectedServices.map((item, index) => {
            const finalPrice = item.service.discountPercentage > 0
              ? item.service.price * (1 - item.service.discountPercentage / 100)
              : item.service.price;

            return (
              <View key={index} style={styles.selectedServiceItem}>
                <Image
                  source={{ uri: item.service.imageUrl || 'https://via.placeholder.com/60' }}
                  style={styles.selectedServiceImage}
                />
                <View style={styles.selectedServiceInfo}>
                  <Text style={styles.selectedServiceName}>{item.service.name}</Text>
                  <Text style={styles.selectedServicePrice}>
                    {formatCurrency(finalPrice)} VNĐ
                  </Text>
                </View>
              </View>
            );
          })}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalPrice}>{formatCurrency(getTotalAmount())} VNĐ</Text>
          </View>
        </View>

        {/* Location Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>Chọn cửa hàng</Text>
          {locations.length === 0 ? (
            <View style={styles.emptyLocation}>
              <Ionicons name="warning-outline" size={24} color="#FF9500" />
              <Text style={{ color: '#999', marginLeft: 8 }}>
                Chưa có cửa hàng nào hoạt động
              </Text>
            </View>
          ) : (
            <>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={[
                    styles.locationItem,
                    selectedLocation?.id === loc.id && styles.locationItemSelected,
                  ]}
                  onPress={() => setSelectedLocation(loc)}
                >
                  <Ionicons
                    name={selectedLocation?.id === loc.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selectedLocation?.id === loc.id ? '#82b440' : '#999'}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.locationName}>{loc.name}</Text>
                    <Text style={styles.locationPhone}>{loc.phone}</Text>
                    <Text style={styles.locationAddress} numberOfLines={2}>
                      {loc.address}
                    </Text>
                    {loc.description && (
                      <Text style={styles.locationDescription} numberOfLines={1}>
                        {loc.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Date Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>Chọn ngày</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={date ? date.toISOString().split('T')[0] : ''}
              onChange={(e: any) => {
                const d = new Date(e.target.value + 'T00:00:00');
                if (!isNaN(d.getTime())) setDate(d);
              }}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowPickerMode('date')}
              >
                <Ionicons name="calendar" size={18} color="#555" />
                <Text style={styles.inputText}>
                  {date ? date.toLocaleDateString('vi-VN') : 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
              {showPickerMode === 'date' && DateTimePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                  onChange={onNativeChange}
                  minimumDate={new Date()}
                  maximumDate={new Date(2100, 0, 1)}
                />
              )}
            </>
          )}
        </View>

        {/* Time Selection */}
        <View style={styles.card}>
          <Text style={styles.label}>Chọn giờ</Text>
          {Platform.OS === 'web' ? (
            <input
              type="time"
              value={time ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}` : ''}
              onChange={(e: any) => {
                const [h, m] = e.target.value.split(':');
                const t = new Date();
                t.setHours(parseInt(h), parseInt(m), 0, 0);
                setTime(t);
              }}
              style={{ padding: 12, borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 14 }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.inputButton}
                onPress={() => setShowPickerMode('time')}
              >
                <Ionicons name="time" size={18} color="#555" />
                <Text style={styles.inputText}>
                  {time ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}` : 'Chọn giờ'}
                </Text>
              </TouchableOpacity>
              {showPickerMode === 'time' && DateTimePicker && (
                <DateTimePicker
                  value={time || new Date()}
                  mode="time"
                  display={Platform.OS === 'android' ? 'clock' : 'spinner'}
                  onChange={onNativeChange}
                />
              )}
            </>
          )}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Thêm ghi chú cho booking..."
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="calendar-check" size={18} color="#fff" />
              <Text style={styles.submitButtonText}>
                Xác nhận đặt lịch • {formatCurrency(getTotalAmount())} VNĐ
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

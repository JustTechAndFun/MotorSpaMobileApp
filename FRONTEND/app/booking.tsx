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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Button, Colors, Spacings, Card } from 'react-native-ui-lib';
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
        <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
      <View flex bg-grey80>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View row centerV paddingH-20 paddingV-15 bg-white style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey70 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
          </TouchableOpacity>
          <Text h5 marginL-20 textColor style={{ fontWeight: '700' }}>Book Service</Text>
        </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Selected Services */}
        <Card padding-20 marginB-20 bg-white style={{ borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <View row spread centerV marginB-15>
            <Text bodyStrong textColor style={{ fontSize: 18, fontWeight: '700' }}>Selected Services</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text primaryColor style={{ fontWeight: '600' }}>Edit</Text>
            </TouchableOpacity>
          </View>

          {selectedServices.map((item, index) => {
            const finalPrice = item.service.discountPercentage > 0
              ? item.service.price * (1 - item.service.discountPercentage / 100)
              : item.service.price;

            return (
              <View key={index} row centerV marginB-15 paddingB-15 style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey70 }}>
                <Image
                  source={{ uri: item.service.imageUrl || 'https://via.placeholder.com/60' }}
                  style={{ width: 60, height: 60, borderRadius: 12 }}
                />
                <View flex marginL-15>
                  <Text body textColor style={{ fontWeight: '600' }}>{item.service.name}</Text>
                  <Text bodySmall primaryColor style={{ fontWeight: '700' }}>
                    {formatCurrency(finalPrice)} VNĐ
                  </Text>
                </View>
              </View>
            );
          })}

          <View row spread marginT-10>
            <Text body textColor style={{ fontWeight: '600' }}>Total Amount</Text>
            <Text h6 primaryColor style={{ fontWeight: '800' }}>{formatCurrency(getTotalAmount())} VNĐ</Text>
          </View>
        </Card>

        {/* Location Selection */}
        <Card padding-20 marginB-20 bg-white style={{ borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text bodyStrong textColor marginB-15 style={{ fontSize: 18, fontWeight: '700' }}>Choose Location</Text>
          {locations.length === 0 ? (
            <View row centerV bg-orange80 padding-15 style={{ borderRadius: 12 }}>
              <Ionicons name="warning-outline" size={20} color={Colors.orange30} />
              <Text marginL-10 grey30>No stores currently available</Text>
            </View>
          ) : (
            <View>
              {locations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  onPress={() => setSelectedLocation(loc)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 15,
                    borderRadius: 15,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: selectedLocation?.id === loc.id ? Colors.primaryColor : Colors.grey70,
                    backgroundColor: selectedLocation?.id === loc.id ? Colors.indigo80 : 'white',
                  }}
                >
                  <Ionicons
                    name={selectedLocation?.id === loc.id ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={selectedLocation?.id === loc.id ? Colors.primaryColor : Colors.grey30}
                  />
                  <View flex marginL-12>
                    <Text body textColor style={{ fontWeight: selectedLocation?.id === loc.id ? '700' : '600' }}>{loc.name}</Text>
                    <Text bodySmall grey40 marginT-2>{loc.address}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Date Selection */}
        <Card padding-20 marginB-20 bg-white style={{ borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text bodyStrong textColor marginB-15 style={{ fontSize: 18, fontWeight: '700' }}>Schedule Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={date ? date.toISOString().split('T')[0] : ''}
              onChange={(e: any) => {
                const d = new Date(e.target.value + 'T00:00:00');
                if (!isNaN(d.getTime())) setDate(d);
              }}
              style={{
                width: '100%',
                padding: 15,
                borderRadius: 12,
                border: `1px solid ${Colors.grey70}`,
                backgroundColor: 'white',
                fontSize: 16,
                color: Colors.textColor,
                outline: 'none'
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  borderRadius: 12,
                  backgroundColor: Colors.grey70,
                }}
                onPress={() => setShowPickerMode('date')}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primaryColor} />
                <Text marginL-12 textColor style={{ fontSize: 16 }}>
                  {date ? date.toLocaleDateString('vi-VN') : 'Select date'}
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
        </Card>

        {/* Time Selection */}
        <Card padding-20 marginB-20 bg-white style={{ borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text bodyStrong textColor marginB-15 style={{ fontSize: 18, fontWeight: '700' }}>Schedule Time</Text>
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
              style={{
                width: '100%',
                padding: 15,
                borderRadius: 12,
                border: `1px solid ${Colors.grey70}`,
                backgroundColor: 'white',
                fontSize: 16,
                color: Colors.textColor,
                outline: 'none'
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 15,
                  borderRadius: 12,
                  backgroundColor: Colors.grey70,
                }}
                onPress={() => setShowPickerMode('time')}
              >
                <Ionicons name="time-outline" size={20} color={Colors.primaryColor} />
                <Text marginL-12 textColor style={{ fontSize: 16 }}>
                  {time ? `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}` : 'Select time'}
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
        </Card>

        {/* Notes */}
        <Card padding-20 marginB-30 bg-white style={{ borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
          <Text bodyStrong textColor marginB-15 style={{ fontSize: 18, fontWeight: '700' }}>Notes (Optional)</Text>
          <TextInput
            style={{
              backgroundColor: Colors.grey70,
              borderRadius: 15,
              padding: 15,
              height: 100,
              fontSize: 16,
              color: Colors.textColor,
              textAlignVertical: 'top'
            }}
            placeholder="Add special requests..."
            placeholderTextColor={Colors.grey40}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </Card>

        {/* Submit Button */}
        <Button
          label={submitting ? "Processing..." : `Confirm Booking • ${formatCurrency(getTotalAmount())} VNĐ`}
          backgroundColor={Colors.primaryColor}
          size="large"
          borderRadius={18}
          marginB-40
          onPress={handleSubmit}
          disabled={submitting}
          labelStyle={{ fontWeight: '800', fontSize: 16 }}
          iconSource={() => !submitting && <FontAwesome5 name="calendar-check" size={18} color="#fff" style={{ marginRight: 10 }} />}
          enableShadow
        />
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

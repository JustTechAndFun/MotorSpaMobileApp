import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../services';
import { BookingStatus, BookingWithServices } from '../types/api.types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#FF9500',
  confirmed: '#007AFF',
  in_progress: '#5856D6',
  completed: '#34C759',
  cancelled: '#FF3B30',
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function BookingDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  
  const [booking, setBooking] = useState<BookingWithServices | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadBookingDetail();
    }
  }, [params.id]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookingWithServices(params.id);
      setBooking(data);
    } catch (error: any) {
      console.error('Error loading booking detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin booking');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy lịch đặt này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Hủy lịch',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelling(true);
              await bookingService.updateBooking(params.id, { status: 'cancelled' });
              Alert.alert('Thành công', 'Đã hủy lịch đặt');
              loadBookingDetail();
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Lỗi', 'Không thể hủy lịch đặt');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt lịch</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đặt lịch</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin booking</Text>
        </View>
      </View>
    );
  }

  const bookingDate = new Date(booking.bookingDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đặt lịch</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadgeLarge, { backgroundColor: STATUS_COLORS[booking.status] }]}>
              <Text style={styles.statusTextLarge}>{STATUS_LABELS[booking.status]}</Text>
            </View>
            <View style={styles.bookingIdContainer}>
              <Text style={styles.bookingIdLabel}>Mã đặt lịch:</Text>
              <Text style={styles.bookingId}>#{String(booking.id).slice(0, 8)}</Text>
            </View>
          </View>
        </View>

        {/* Date & Time Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thời gian</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#82b440" />
            <Text style={styles.infoText}>
              {bookingDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color="#82b440" />
            <Text style={styles.infoText}>
              {bookingDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Location Card */}
        {booking.location && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Địa chỉ dịch vụ</Text>
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#82b440" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.locationName}>{booking.location.fullName}</Text>
                <Text style={styles.locationPhone}>{booking.location.phoneNumber}</Text>
                <Text style={styles.locationAddress}>{booking.location.address}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Services Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dịch vụ đã chọn</Text>
          {booking.services.map((item, index) => (
            <View key={index} style={styles.serviceItem}>
              <Image
                source={{ uri: item.service.imageUrl || 'https://via.placeholder.com/60' }}
                style={styles.serviceImage}
              />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.service.name}</Text>
                <View style={styles.servicePriceRow}>
                  <Text style={styles.servicePrice}>
                    {formatCurrency(item.price)} VNĐ × {item.quantity}
                  </Text>
                  <Text style={styles.serviceTotal}>
                    {formatCurrency(item.totalPrice)} VNĐ
                  </Text>
                </View>
                {item.notes && (
                  <Text style={styles.serviceNotes}>Ghi chú: {item.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Notes Card */}
        {booking.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ghi chú</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}

        {/* Payment Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thanh toán</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tổng tiền:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(booking.totalAmount)} VNĐ</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Trạng thái:</Text>
            {booking.isPaid ? (
              <View style={styles.paidBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.paidText}>Đã thanh toán</Text>
              </View>
            ) : (
              <Text style={styles.unpaidText}>Chưa thanh toán</Text>
            )}
          </View>
        </View>

        {/* Cancel Button */}
        {booking.status === 'pending' && (
          <TouchableOpacity
            style={[styles.cancelButton, cancelling && { opacity: 0.6 }]}
            onPress={handleCancelBooking}
            disabled={cancelling}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.cancelButtonText}>Hủy lịch đặt</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#333',
    marginBottom: 12,
  },
  statusContainer: {
    alignItems: 'center' as const,
  },
  statusBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusTextLarge: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  bookingIdContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  bookingIdLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  locationInfo: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  locationPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  serviceItem: {
    flexDirection: 'row' as const,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 4,
  },
  servicePriceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 13,
    color: '#666',
  },
  serviceTotal: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#82b440',
  },
  serviceNotes: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic' as const,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  paymentRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#666',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#82b440',
  },
  paidBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  paidText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 6,
    fontWeight: '600' as const,
  },
  unpaidText: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600' as const,
  },
  cancelButton: {
    flexDirection: 'row' as const,
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginLeft: 8,
  },
};

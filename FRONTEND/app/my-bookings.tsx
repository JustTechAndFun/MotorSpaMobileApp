import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { bookingService } from '../services';
import { Booking, BookingStatus } from '../types/api.types';

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

export default function MyBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getMyBookings();
      const sorted = data.sort((a, b) => 
        new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      setBookings(sorted);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách booking');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, []);

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const bookingDate = new Date(item.bookingDate);
    
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/booking-detail?id=${item.id}`)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bookingIdContainer}>
            <Ionicons name="receipt-outline" size={16} color="#666" />
            <Text style={styles.bookingId}>#{String(item.id).slice(0, 8)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {bookingDate.toLocaleDateString('vi-VN', { 
              weekday: 'short',
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {bookingDate.toLocaleTimeString('vi-VN', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {/* Location */}
        {item.location && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.location.address}
            </Text>
          </View>
        )}

        {/* Total Amount */}
        <View style={styles.cardFooter}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Tổng tiền:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)} VNĐ</Text>
          </View>
          {item.isPaid && (
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <Text style={styles.paidText}>Đã thanh toán</Text>
            </View>
          )}
        </View>

        {/* Arrow */}
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#CCC" 
          style={styles.arrow}
        />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch đặt của tôi</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch đặt của tôi</Text>
        <TouchableOpacity onPress={() => router.push('/select-service')} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#82b440" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#82b440']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Chưa có lịch đặt nào</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/select-service')}
            >
              <Text style={styles.createButtonText}>Đặt lịch ngay</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
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
  addButton: {
    padding: 8,
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
  listContent: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative' as const,
  },
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  bookingIdContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#666',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#82b440',
  },
  paidBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  paidText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
    fontWeight: '600' as const,
  },
  arrow: {
    position: 'absolute' as const,
    right: 16,
    top: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#82b440',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
};

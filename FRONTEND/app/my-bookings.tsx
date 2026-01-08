import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Button, Card, Colors, Text, View } from 'react-native-ui-lib';
import { bookingService } from '../services';
import { Booking, BookingStatus } from '../types/api.types';

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#F59E0B',      // Warning / Amber
  confirmed: '#6366F1',    // Primary / Indigo
  in_progress: '#10B981',  // Success / Emerald
  completed: '#10B981',    // Success
  cancelled: '#EF4444',    // Error / Red
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
      <Card
        padding-18
        marginB-16
        enableShadow
        onPress={() => router.push(`/booking-detail?id=${item.id}`)}
        style={{ borderRadius: 18 }}
      >
        {/* Header */}
        <View row spread centerV marginB-14>
          <View row centerV>
            <View
              width={36}
              height={36}
              center
              br100
              style={{ backgroundColor: Colors.grey80 }}
            >
              <Ionicons name="calendar" size={20} color={Colors.textColor} />
            </View>
            <Text text70 textColor marginL-12 style={{ fontWeight: 'bold' }}>
              #{String(item.id).slice(0, 8)}
            </Text>
          </View>
          <View
            paddingH-12
            paddingV-6
            style={{
              backgroundColor: STATUS_COLORS[item.status] + '20',
              borderRadius: 12
            }}
          >
            <Text
              text90
              style={{
                color: STATUS_COLORS[item.status],
                fontWeight: 'bold'
              }}
            >
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {/* Date and Time */}
        <View row marginB-10>
          <View row centerV marginR-20 flex>
            <Ionicons name="calendar-outline" size={16} color={Colors.grey40} />
            <Text text80 grey40 marginL-8>
              {bookingDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </Text>
          </View>
          <View row centerV>
            <Ionicons name="time-outline" size={16} color={Colors.grey40} />
            <Text text80 grey40 marginL-8>
              {bookingDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Location */}
        {item.location && (
          <View row centerV marginB-12>
            <Ionicons name="location-outline" size={16} color={Colors.grey40} />
            <Text text80 grey40 marginL-8 numberOfLines={1} flex>
              {item.location.address}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View
          row
          spread
          centerV
          paddingT-14
          style={{
            borderTopWidth: 1,
            borderTopColor: Colors.grey80
          }}
        >
          <View>
            <Text text90 grey40 style={{ fontWeight: '500' }}>Total</Text>
            <Text text60 primaryColor marginT-4 style={{ fontWeight: 'bold' }}>
              {formatCurrency(item.totalAmount)} VNĐ
            </Text>
          </View>
          {item.isPaid && (
            <View row centerV paddingH-12 paddingV-6 style={{ backgroundColor: Colors.success + '20', borderRadius: 12 }}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text text90 style={{ color: Colors.success, fontWeight: 'bold', marginLeft: 6 }}>PAID</Text>
            </View>
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View flex bg-grey80>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View flex bg-grey80>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View
        row
        centerV
        paddingH-20
        paddingT-15
        paddingB-18
        bg-white
        style={{
          borderBottomWidth: 1.5,
          borderBottomColor: Colors.grey70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Colors.grey80,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text text40 textColor flex style={{ fontWeight: 'bold' }}>My Bookings</Text>
        <TouchableOpacity
          onPress={() => router.push('/select-service')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Colors.primaryColor + '20',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="add" size={28} color={Colors.primaryColor} />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryColor]} />
        }
        ListEmptyComponent={
          <View flex center paddingH-40 marginT-40>
            <View
              width={120}
              height={120}
              center
              br100
              bg-white
              marginB-25
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Ionicons name="calendar-outline" size={60} color={Colors.grey40} />
            </View>
            <Text text50 textColor center style={{ fontWeight: 'bold' }}>No bookings yet</Text>
            <Text text80 grey40 center marginT-12 style={{ lineHeight: 24 }}>
              Book your first service now!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/select-service')}
              activeOpacity={0.7}
              style={{
                marginTop: 30,
                paddingHorizontal: 32,
                paddingVertical: 16,
                backgroundColor: Colors.primaryColor,
                borderRadius: 18,
                shadowColor: Colors.primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6
              }}
            >
              <Text text70 white style={{ fontWeight: 'bold' }}>Book Now</Text>
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

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import { bookingService } from '../../services';
import { Booking, BookingListParams, BookingStatus } from '../../types/api.types';

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

const FILTER_OPTIONS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chờ xác nhận', value: 'pending' },
  { label: 'Đã xác nhận', value: 'confirmed' },
  { label: 'Đang thực hiện', value: 'in_progress' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đã hủy', value: 'cancelled' },
];

export default function BookingManagementScreen() {
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<BookingStatus | 'all'>('all');
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, selectedFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params: BookingListParams = selectedFilter !== 'all' ? { status: selectedFilter } : {};
      const data = await bookingService.getAllBookings(params);
      
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

  const filterBookings = () => {
    let filtered = [...bookings];

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(b => b.status === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        String(b.id).toLowerCase().includes(query) ||
        b.user?.name.toLowerCase().includes(query) ||
        b.user?.phone.toLowerCase().includes(query) ||
        b.location?.address.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [selectedFilter]);

  const handleUpdateStatus = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowStatusModal(true);
  };

  const confirmUpdateStatus = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;

    try {
      setUpdating(true);
      await bookingService.updateBooking(String(selectedBooking.id), { status: newStatus });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái booking');
      setShowStatusModal(false);
      setSelectedBooking(null);
      loadBookings();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      in_progress: bookings.filter(b => b.status === 'in_progress').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  };

  const stats = getStatusStats();

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
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}
            onPress={() => handleUpdateStatus(item)}
          >
            <Text style={styles.statusText}>{STATUS_LABELS[item.status]}</Text>
            <Ionicons name="create-outline" size={14} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        {/* Customer Info */}
        {item.user && (
          <View style={styles.customerInfo}>
            <Ionicons name="person-outline" size={18} color="#666" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.customerName}>{item.user.name}</Text>
              <Text style={styles.customerPhone}>{item.user.phone}</Text>
            </View>
          </View>
        )}

        {/* Date and Time */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <Text style={styles.infoText}>
            {bookingDate.toLocaleDateString('vi-VN', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric' 
            })} - {bookingDate.toLocaleTimeString('vi-VN', { 
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
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý Booking</Text>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: STATUS_COLORS.pending }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Chờ</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: STATUS_COLORS.confirmed }]}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Xác nhận</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: STATUS_COLORS.in_progress }]}>{stats.in_progress}</Text>
          <Text style={styles.statLabel}>Đang làm</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: STATUS_COLORS.completed }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Xong</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã, tên, SĐT, địa chỉ..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilter === item.value && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilter === item.value && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#82b440']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>Không có booking nào</Text>
          </View>
        }
      />

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cập nhật trạng thái</Text>
            <Text style={styles.modalSubtitle}>
              Booking: #{String(selectedBooking?.id).slice(0, 8)}
            </Text>

            {(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as BookingStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusOption,
                  selectedBooking?.status === status && styles.statusOptionActive,
                ]}
                onPress={() => confirmUpdateStatus(status)}
                disabled={updating}
              >
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[status] }]} />
                <Text style={styles.statusOptionText}>{STATUS_LABELS[status]}</Text>
                {selectedBooking?.status === status && (
                  <Ionicons name="checkmark" size={20} color="#82b440" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowStatusModal(false)}
              disabled={updating}
            >
              <Text style={styles.modalCancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000',
    flex: 1,
    textAlign: 'center' as const,
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
  statsContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#82b440',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#82b440',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600' as const,
  },
  filterChipTextActive: {
    color: '#fff',
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  customerInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
  },
  customerPhone: {
    fontSize: 13,
    color: '#666',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: 340,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#333',
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  statusOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  statusOptionActive: {
    backgroundColor: '#e8f5e8',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center' as const,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600' as const,
  },
};

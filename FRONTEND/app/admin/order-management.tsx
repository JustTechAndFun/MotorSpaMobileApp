import { orderService } from '@/services';
import type { Order, UpdateOrderStatusRequest } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../../styles/admin-order-management-styles';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

const statusColors: Record<string, string> = {
  pending: '#FFA500',
  PENDING: '#FFA500',
  processing: '#2196F3',
  PROCESSING: '#2196F3',
  confirmed: '#9C27B0',
  CONFIRMED: '#9C27B0',
  shipping: '#00BCD4',
  SHIPPING: '#00BCD4',
  delivered: '#4CAF50',
  DELIVERED: '#4CAF50',
  cancelled: '#F44336',
  CANCELLED: '#F44336',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  SHIPPING: 'Shipping',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function AdminOrderManagement() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status.toUpperCase() as OrderStatus);
    setNotes('');
    setModalVisible(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setUpdating(true);
      const updateData: UpdateOrderStatusRequest = {
        status: newStatus,
        notes: notes || undefined,
      };
      
      await orderService.updateOrderStatus(String(selectedOrder.id), updateData);
      
      setOrders(prev => 
        prev.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: newStatus.toLowerCase() as any, notes: notes || order.notes }
            : order
        )
      );
      
      setModalVisible(false);
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error: any) {
      console.error('Error updating order:', error);
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const getStatusColor = (status: string) => {
    return statusColors[status] || '#999';
  };

  const getStatusLabel = (status: string) => {
    return statusLabels[status.toUpperCase()] || status;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress?.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || order.status.toUpperCase() === filterStatus.toUpperCase();
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status.toUpperCase() === 'PENDING').length,
    processing: orders.filter(o => o.status.toUpperCase() === 'PROCESSING').length,
    delivered: orders.filter(o => o.status.toUpperCase() === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status.toUpperCase() === 'CANCELLED').length,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Management</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.statCard, filterStatus === 'all' && styles.statCardActive]}
            onPress={() => setFilterStatus('all')}
          >
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, filterStatus === 'PENDING' && styles.statCardActive]}
            onPress={() => setFilterStatus('PENDING')}
          >
            <Text style={[styles.statNumber, { color: statusColors.PENDING }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, filterStatus === 'PROCESSING' && styles.statCardActive]}
            onPress={() => setFilterStatus('PROCESSING')}
          >
            <Text style={[styles.statNumber, { color: statusColors.PROCESSING }]}>{stats.processing}</Text>
            <Text style={styles.statLabel}>Processing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, filterStatus === 'DELIVERED' && styles.statCardActive]}
            onPress={() => setFilterStatus('DELIVERED')}
          >
            <Text style={[styles.statNumber, { color: statusColors.DELIVERED }]}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, filterStatus === 'CANCELLED' && styles.statCardActive]}
            onPress={() => setFilterStatus('CANCELLED')}
          >
            <Text style={[styles.statNumber, { color: statusColors.CANCELLED }]}>{stats.cancelled}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID, customer name, phone..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Orders List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {searchQuery || filterStatus !== 'all' ? 'No orders found' : 'No orders yet'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#82b440']} />
          }
        >
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => openUpdateModal(order)}
            >
              {/* Order Header */}
              <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                  <Ionicons name="receipt" size={16} color="#666" />
                  <Text style={styles.orderId}>#{String(order.id).slice(0, 8)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {getStatusLabel(order.status)}
                  </Text>
                </View>
              </View>

              {/* Customer Info */}
              <View style={styles.customerInfo}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.customerName}>{order.deliveryAddress?.name || 'N/A'}</Text>
                <Text style={styles.customerPhone}> • {order.deliveryAddress?.phone || 'N/A'}</Text>
              </View>

              {/* Order Details */}
              <View style={styles.orderDetails}>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="cube-outline" size={16} color="#666" />
                  <Text style={styles.orderDetailText}>
                    {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                  </Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.orderDetailText}>{formatDate(order.createdAt)}</Text>
                </View>
              </View>

              {/* Address */}
              {order.deliveryAddress && (
                <View style={styles.addressContainer}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.addressText} numberOfLines={2}>
                    {order.deliveryAddress.address}
                  </Text>
                </View>
              )}

              {/* Total */}
              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalAmount}>VND {formatCurrency(order.total)}</Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity 
                style={styles.updateButton}
                onPress={() => openUpdateModal(order)}
              >
                <Ionicons name="create-outline" size={16} color="#82b440" />
                <Text style={styles.updateButtonText}>Update Status</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Update Status Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Order Status</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <>
                <View style={styles.modalOrderInfo}>
                  <Text style={styles.modalOrderId}>Order #{String(selectedOrder.id).slice(0, 8)}</Text>
                  <Text style={styles.modalCustomer}>{selectedOrder.deliveryAddress?.name}</Text>
                </View>

                {/* Status Selection */}
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusGrid}>
                  {(['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        newStatus === status && styles.statusOptionSelected,
                        { borderColor: getStatusColor(status) }
                      ]}
                      onPress={() => setNewStatus(status)}
                    >
                      <Text style={[
                        styles.statusOptionText,
                        newStatus === status && { color: getStatusColor(status) }
                      ]}>
                        {getStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Notes Input */}
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes about this status update..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                    disabled={updating}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, updating && styles.confirmButtonDisabled]}
                    onPress={handleUpdateStatus}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Update</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

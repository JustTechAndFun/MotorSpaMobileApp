import { orderService } from '@/services';
import { Order } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../styles/order-detail-styles';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrderById(id as string);
      setOrder(data);
    } catch (error: any) {
      console.error('Load order detail error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'processing':
        return '#2196F3';
      case 'confirmed':
        return '#4CAF50';
      case 'shipping':
        return '#00BCD4';
      case 'delivered':
        return '#8BC34A';
      case 'cancelled':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'confirmed':
        return 'Confirmed';
      case 'shipping':
        return 'Shipping';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={styles.loadingText}>Loading order detail...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Detail</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order Status */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(order.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(order.status) },
              ]}
            >
              {getStatusText(order.status)}
            </Text>
          </View>
          <Text style={styles.orderId}>Order #{order.id.toString().slice(0, 8)}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="#82b440" />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{order.deliveryAddress.name}</Text>
              <Text style={styles.addressPhone}>{order.deliveryAddress.phone}</Text>
              <Text style={styles.addressDetail}>{order.deliveryAddress.address}</Text>
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cart" size={20} color="#82b440" />
            <Text style={styles.sectionTitle}>Order Items</Text>
          </View>
          {order.items.map((item, index) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemRow}>
                {item.product?.imageUrl && (
                  <Image
                    source={{ uri: item.product.imageUrl }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {item.product?.name || `Product ${item.productId}`}
                  </Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.price)} VNĐ</Text>
                </View>
              </View>
              <View style={styles.itemTotal}>
                <Text style={styles.itemTotalLabel}>Subtotal:</Text>
                <Text style={styles.itemTotalAmount}>
                  {formatCurrency(item.price * item.quantity)} VNĐ
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color="#82b440" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentText}>{order.paymentMethod}</Text>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbox" size={20} color="#82b440" />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total)} VNĐ</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { orderService } from '@/services';
import { Order } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Card, Colors } from 'react-native-ui-lib';

export default function OrdersPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const fromCheckout = params.fromCheckout === 'true';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [])
  );

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error: any) {
      console.error('Load orders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBackPress = () => {
    if (fromCheckout) {
      router.replace('/home');
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>
      <View flex bg-grey80>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />

        {/* Modern Header */}
        <View
          row
          centerV
          paddingH-20
          paddingV-18
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
          onPress={handleBackPress}
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
        <Text text40 textColor style={{ fontWeight: 'bold' }}>My Orders</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View flex center paddingH-40>
          <View
            width={120}
            height={120}
            center
            br100
            bg-grey80
            marginB-25
          >
            <Ionicons name="receipt-outline" size={60} color={Colors.grey40} />
          </View>
          <Text text50 textColor center style={{ fontWeight: 'bold' }}>No orders yet</Text>
          <Text text80 grey40 center marginT-12 style={{ lineHeight: 24 }}>
            Start shopping to create your first order!
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/home')}
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
            <Text text70 white style={{ fontWeight: 'bold' }}>Go Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primaryColor]}
            />
          }
        >
          {orders.map((order) => (
            <Card
              key={order.id}
              padding-18
              marginB-16
              enableShadow
              onPress={() => router.push(`/order-detail?id=${order.id}`)}
              style={{ borderRadius: 18 }}
            >
              {/* Order Header */}
              <View row spread centerV marginB-14>
                <View row centerV>
                  <View
                    width={36}
                    height={36}
                    center
                    br100
                    style={{ backgroundColor: Colors.grey80 }}
                  >
                    <Ionicons name="receipt" size={20} color={Colors.textColor} />
                  </View>
                  <Text text70 textColor marginL-12 style={{ fontWeight: 'bold' }}>
                    Order #{order.id.toString().slice(0, 8)}
                  </Text>
                </View>
                <View
                  paddingH-12
                  paddingV-6
                  style={{
                    backgroundColor: getStatusColor(order.status) + '20',
                    borderRadius: 12
                  }}
                >
                  <Text
                    text90
                    style={{
                      color: getStatusColor(order.status),
                      fontWeight: 'bold'
                    }}
                  >
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>

              {/* Order Items Summary */}
              <View marginB-12>
                <Text text80 grey40 style={{ fontWeight: '500' }}>
                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </Text>
                {order.deliveryAddress && (
                  <View row centerV marginT-8>
                    <Ionicons name="location-outline" size={16} color={Colors.grey40} />
                    <Text text80 grey40 marginL-8 flex numberOfLines={1}>
                      {order.deliveryAddress.address}
                    </Text>
                  </View>
                )}
              </View>

              {/* Order Footer */}
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
                    {formatCurrency(order.total)} VNĐ
                  </Text>
                </View>
                <Text text90 grey40 style={{ fontWeight: '500' }}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}
      </View>
    </SafeAreaView>
  );
}

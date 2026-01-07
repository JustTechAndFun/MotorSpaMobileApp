import { addressService, cartService, orderService, paymentMethodService } from '@/services';
import type { Address, PaymentMethod } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../styles/checkout-styles';

interface CartItem {
  id: string | number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string;
  };
  quantity: number;
  price: number;
  totalPrice: number;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  let items: CartItem[] = [];
  let isFromCart = false;
  try {
    items = params.items ? JSON.parse(params.items as string) : [];
    isFromCart = params.fromCart === 'true';
  } catch (error) {
    console.error('Error parsing items:', error);
  }

  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    loadAddresses();
    loadPaymentMethods();
  }, []);

  const loadAddresses = async () => {
    try {
      const addresses = await addressService.getAddresses();
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
      setDeliveryAddress(defaultAddress || null);
    } catch (error) {
      console.error('Error loading addresses:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentMethodService.getPaymentMethods();
      setPaymentMethods(methods);
      const defaultMethod = methods.find(m => m.isDefault) || methods[0];
      if (defaultMethod) {
        setSelectedPayment(defaultMethod);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const getPaymentIcon = (method: PaymentMethod): string => {
    if (method.type === 'CREDIT_CARD' || method.type === 'DEBIT_CARD') {
      return 'card';
    } else if (method.type === 'BANK_TRANSFER') {
      return 'business';
    } else if (method.type === 'E_WALLET') {
      return 'wallet';
    } else if (method.type === 'COD') {
      return 'cash';
    }
    return 'card';
  };

  const getPaymentLabel = (method: PaymentMethod): string => {
    if (method.lastFourDigits) {
      return `${method.name} •••• ${method.lastFourDigits}`;
    }
    return method.name;
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal;

  const handleConfirmOrder = async () => {
    if (!deliveryAddress) {
      Alert.alert('Error', 'Please add a delivery address');
      return;
    }

    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (items.length === 0) {
      Alert.alert('Error', 'No items in cart');
      return;
    }

    try {
      setIsCreatingOrder(true);

      const orderRequest = {
        deliveryAddressId: String(deliveryAddress.id),
        items: items.map(item => ({
          productId: String(item.product.id),
          quantity: item.quantity,
        })),
        paymentMethod: String(selectedPayment.id),
        notes: '',
      };

      const order = await orderService.createOrder(orderRequest);

      if (isFromCart) {
        try {
          await cartService.clearCart();
        } catch (cartError) {
          console.error('Error clearing cart:', cartError);
        }
      }

      Alert.alert(
        'Order Created Successfully',
        `Your order has been placed.\nOrder ID: ${order.id.toString().slice(0, 8)}\nTotal: ${formatCurrency(total)} VNĐ`,
        [
          {
            text: 'View Orders',
            onPress: () => router.push('/orders'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.push('/home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Create order error:', error);
      Alert.alert(
        'Order Failed',
        error.message || 'Failed to create order. Please try again.',
        [
          {
            text: 'Retry',
            onPress: handleConfirmOrder,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Section 1: Product & Delivery Address */}
          <View style={styles.section}>
            {/* Product Box */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="cube-outline" size={20} color="#333" />
                <Text style={styles.cardTitle}>Product</Text>
              </View>
              {items.map((item) => (
                <View key={item.id} style={styles.productRow}>
                  <Image
                    source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/80' }}
                    style={styles.productImage}
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.product.name}
                    </Text>
                    <View style={styles.productDetails}>
                      <Text style={styles.quantity}>x{item.quantity}</Text>
                      <Text style={styles.price}>
                        Rp. {formatCurrency(item.price)}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Delivery Address Box */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location-outline" size={20} color="#333" />
                <Text style={styles.cardTitle}>Delivery Address</Text>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push('/setting-location')}
                >
                  <Text style={styles.editText}>Change</Text>
                </TouchableOpacity>
              </View>
              {loadingAddress ? (
                <ActivityIndicator size="small" color="#82b440" style={{ marginVertical: 12 }} />
              ) : deliveryAddress ? (
                <View style={styles.addressContent}>
                  <Text style={styles.addressName}>{deliveryAddress.name}</Text>
                  <Text style={styles.addressDetails}>{deliveryAddress.phone}</Text>
                  <Text style={styles.addressCity}>{deliveryAddress.address}</Text>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.emptyState}
                  onPress={() => router.push('/add-location')}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#82b440" />
                  <Text style={styles.emptyStateText}>Add Delivery Address</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Section 2: Payment Method */}
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="cash-outline" size={20} color="#333" />
                <Text style={styles.cardTitle}>Payment Method</Text>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setPaymentModalVisible(true)}
                >
                  <Text style={styles.editText}>Change</Text>
                </TouchableOpacity>
              </View>
              {loadingPayments ? (
                <ActivityIndicator size="small" color="#82b440" style={{ marginVertical: 12 }} />
              ) : selectedPayment ? (
                <View style={styles.paymentOption}>
                  <Ionicons name={getPaymentIcon(selectedPayment) as any} size={20} color="#333" />
                  <Text style={styles.paymentLabel}>{getPaymentLabel(selectedPayment)}</Text>
                  {selectedPayment.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.addPaymentButton}
                  onPress={() => router.push('/setting-payment')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#82b440" />
                  <Text style={styles.addPaymentText}>Add Payment Method</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Section 3: Price Details */}
          <View style={styles.section}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="receipt-outline" size={20} color="#333" />
                <Text style={styles.cardTitle}>Purchase Details</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total Price ({items.length} {items.length === 1 ? 'product' : 'products'})</Text>
                <Text style={styles.priceValue}>Rp. {formatCurrency(subtotal)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payment</Text>
                <Text style={styles.totalValue}>Rp. {formatCurrency(total)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom: Order Now Button */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Total Payment:</Text>
            <Text style={styles.footerTotal}>Rp. {formatCurrency(total)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.confirmButton, isCreatingOrder && styles.confirmButtonDisabled]} 
            onPress={handleConfirmOrder}
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Order Now</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Method Selection Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodItem,
                    selectedPayment?.id === method.id && styles.paymentMethodItemSelected
                  ]}
                  onPress={() => {
                    setSelectedPayment(method);
                    setPaymentModalVisible(false);
                  }}
                >
                  <View style={styles.paymentMethodIcon}>
                    <Ionicons name={getPaymentIcon(method) as any} size={24} color="#82b440" />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <View style={styles.paymentMethodNameRow}>
                      <Text style={styles.paymentMethodName}>{method.name}</Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentMethodDetails}>
                      {method.lastFourDigits && `•••• ${method.lastFourDigits}`}
                      {method.cardBrand && ` • ${method.cardBrand}`}
                      {method.walletProvider && method.walletProvider}
                      {method.bankName && method.bankName}
                    </Text>
                  </View>
                  {selectedPayment?.id === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#82b440" />
                  )}
                </TouchableOpacity>
              ))}

              {paymentMethods.length === 0 && (
                <View style={styles.emptyPayment}>
                  <Ionicons name="card-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyPaymentText}>No payment methods available</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.addPaymentMethodButton}
                onPress={() => {
                  setPaymentModalVisible(false);
                  router.push('/setting-payment');
                }}
              >
                <Ionicons name="add-circle" size={20} color="#82b440" />
                <Text style={styles.addPaymentMethodText}>Add New Payment Method</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatCurrency(n: number | null | undefined) {
  if (n == null || isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

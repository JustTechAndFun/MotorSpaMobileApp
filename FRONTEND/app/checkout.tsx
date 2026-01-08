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
} from 'react-native';
import { Button, Card, Colors, Text, TouchableOpacity, View } from 'react-native-ui-lib';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.screenBG }}>
      {/* Header */}
      <View row centerV padding-20 bg-white style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey70 }}>
        <TouchableOpacity style={{ marginRight: 15 }} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.grey10} />
        </TouchableOpacity>
        <Text h3 textColor>Checkout</Text>
      </View>

      <View flex>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Product & Delivery Address */}
          <View marginB-20>
            {/* Product Card */}
            <Card padding-16 marginB-15 bg-white style={{ borderRadius: 16 }}>
              <View row centerV marginB-12>
                <Ionicons name="cube-outline" size={20} color={Colors.primaryColor} />
                <Text bodyStrong grey10 marginL-8>Products</Text>
              </View>
              {items.map((item) => (
                <View key={item.id} row marginB-12 style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey80, paddingBottom: 12 }}>
                  <Image
                    source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/80' }}
                    style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: Colors.grey80 }}
                  />
                  <View flex marginL-12 centerV>
                    <Text bodySmall grey10 numberOfLines={2} style={{ fontWeight: '600' }}>
                      {item.product.name}
                    </Text>
                    <View row spread centerV marginT-4>
                      <Text caption grey40>Qty: {item.quantity}</Text>
                      <Text bodySmall primaryColor style={{ fontWeight: '700' }}>
                        {formatCurrency(item.price)} VNĐ
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>

            {/* Delivery Address Card */}
            <Card padding-16 bg-white style={{ borderRadius: 16 }}>
              <View row spread centerV marginB-12>
                <View row centerV>
                  <Ionicons name="location-outline" size={20} color={Colors.primaryColor} />
                  <Text bodyStrong grey10 marginL-8>Delivery Address</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/setting-location')}
                >
                  <Text bodySmall primaryColor style={{ fontWeight: '600' }}>Change</Text>
                </TouchableOpacity>
              </View>

              {loadingAddress ? (
                <ActivityIndicator size="small" color={Colors.primaryColor} style={{ marginVertical: 12 }} />
              ) : deliveryAddress ? (
                <View>
                  <Text bodyStrong grey10>{deliveryAddress.name}</Text>
                  <Text bodySmall grey40 marginV-2>{deliveryAddress.phone}</Text>
                  <Text bodySmall grey40 numberOfLines={2}>{deliveryAddress.address}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  row centerV paddingV-12
                  onPress={() => router.push('/add-location')}
                >
                  <Ionicons name="add-circle-outline" size={24} color={Colors.primaryColor} />
                  <Text bodySmall primaryColor marginL-8 style={{ fontWeight: '600' }}>Add Delivery Address</Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>

          {/* Section 2: Payment Method */}
          <View marginB-20>
            <Card padding-16 bg-white style={{ borderRadius: 16 }}>
              <View row spread centerV marginB-12>
                <View row centerV>
                  <Ionicons name="cash-outline" size={20} color={Colors.primaryColor} />
                  <Text bodyStrong grey10 marginL-8>Payment Method</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setPaymentModalVisible(true)}
                >
                  <Text bodySmall primaryColor style={{ fontWeight: '600' }}>Change</Text>
                </TouchableOpacity>
              </View>
              {loadingPayments ? (
                <ActivityIndicator size="small" color={Colors.primaryColor} style={{ marginVertical: 12 }} />
              ) : selectedPayment ? (
                <View row centerV>
                  <Ionicons name={getPaymentIcon(selectedPayment) as any} size={20} color={Colors.grey10} />
                  <Text bodySmall grey10 marginL-12 flex>{getPaymentLabel(selectedPayment)}</Text>
                  {selectedPayment.isDefault && (
                    <View bg-indigo80 paddingH-6 paddingV-2 br10>
                      <Text extraSmall primaryColor style={{ fontWeight: '600' }}>Default</Text>
                    </View>
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  row centerV paddingV-12 center
                  style={{ borderStyle: 'dotted', borderWidth: 1, borderColor: Colors.primaryColor, borderRadius: 12 }}
                  onPress={() => router.push('/setting-payment')}
                >
                  <Ionicons name="add-circle-outline" size={20} color={Colors.primaryColor} />
                  <Text bodySmall primaryColor marginL-8 style={{ fontWeight: '600' }}>Add Payment Method</Text>
                </TouchableOpacity>
              )}
            </Card>
          </View>

          {/* Section 3: Price Details */}
          <View marginB-20>
            <Card padding-16 bg-white style={{ borderRadius: 16 }}>
              <View row centerV marginB-12>
                <Ionicons name="receipt-outline" size={20} color={Colors.primaryColor} />
                <Text bodyStrong grey10 marginL-8>Purchase Details</Text>
              </View>
              <View row spread centerV marginB-8>
                <Text bodySmall grey40>Subtotal ({items.length} services)</Text>
                <Text bodySmall grey10>{formatCurrency(subtotal)} VNĐ</Text>
              </View>
              <View row spread centerV marginB-8>
                <Text bodySmall grey40>Shipping Fee</Text>
                <Text bodySmall grey10>0 VNĐ</Text>
              </View>
              <View height={1} bg-grey80 marginV-12 />
              <View row spread centerV>
                <Text bodyStrong grey10>Total Payment</Text>
                <Text h4 primaryColor>{formatCurrency(total)} VNĐ</Text>
              </View>
            </Card>
          </View>
        </ScrollView>

        {/* Bottom: Order Now Button */}
        <View bg-white padding-20 style={{ borderTopWidth: 1, borderTopColor: Colors.grey70, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 12 }}>
          <View row spread centerV marginB-15>
            <Text bodyStrong grey40>Total Payment</Text>
            <Text h3 primaryColor>{formatCurrency(total)} VNĐ</Text>
          </View>
          <Button
            label={isCreatingOrder ? "Processing..." : "Order Now"}
            onPress={handleConfirmOrder}
            disabled={isCreatingOrder}
            backgroundColor={Colors.primaryColor}
            size="large"
            borderRadius={15}
            enableShadow
            labelStyle={{ fontWeight: '800' }}
          />
        </View>
      </View>

      {/* Payment Method Selection Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View flex style={{ backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View bg-white style={{ borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' }}>
            <View row spread centerV marginB-25>
              <Text h3 grey10>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.grey10} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  padding-16
                  marginB-15
                  onPress={() => {
                    setSelectedPayment(method);
                    setPaymentModalVisible(false);
                  }}
                  style={{
                    borderRadius: 16,
                    borderWidth: selectedPayment?.id === method.id ? 2 : 1,
                    borderColor: selectedPayment?.id === method.id ? Colors.primaryColor : Colors.grey70
                  }}
                >
                  <View row centerV>
                    <View width={48} height={48} br100 bg-indigo80 center marginR-15>
                      <Ionicons name={getPaymentIcon(method) as any} size={24} color={Colors.primaryColor} />
                    </View>
                    <View flex>
                      <View row centerV spread>
                        <Text bodyStrong grey10>{method.name}</Text>
                        {method.isDefault && (
                          <View bg-indigo70 paddingH-8 paddingV-2 br10>
                            <Text extraSmall primaryColor style={{ fontWeight: '600' }}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text bodySmall grey40 marginT-4>
                        {method.lastFourDigits && `•••• ${method.lastFourDigits}`}
                        {method.cardBrand && ` • ${method.cardBrand}`}
                        {method.walletProvider && method.walletProvider}
                        {method.bankName && method.bankName}
                      </Text>
                    </View>
                    {selectedPayment?.id === method.id && (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primaryColor} style={{ marginLeft: 10 }} />
                    )}
                  </View>
                </Card>
              ))}

              {paymentMethods.length === 0 && (
                <View center paddingV-40>
                  <Ionicons name="card-outline" size={64} color={Colors.grey70} />
                  <Text bodySmall grey40 marginT-15>No payment methods available</Text>
                </View>
              )}

              <Button
                label="Add New Payment Method"
                onPress={() => {
                  setPaymentModalVisible(false);
                  router.push('/setting-payment');
                }}
                link
                primaryColor
                marginT-10
                labelStyle={{ fontWeight: '700' }}
                iconSource={() => <Ionicons name="add" size={18} color={Colors.primaryColor} style={{ marginRight: 5 }} />}
              />
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

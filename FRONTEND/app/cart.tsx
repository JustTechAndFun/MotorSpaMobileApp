import { useToast } from '@/components/toast';
import { cartService } from '@/services';
import type { CartItem } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Card, Button, Colors, Spacings, Checkbox } from 'react-native-ui-lib';
import BottomNavigator from '../components/bottom-navigator';
import { styles } from '../styles/cart-styles';

export default function CartScreen() {
  const router = useRouter();
  const toast = useToast();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string | number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();

      const transformedData = data.map((item: any) => {
        const price = parseFloat(item.product.price) || 0;
        return {
          ...item,
          price,
          totalPrice: price * item.quantity,
        };
      });

      setCartItems(transformedData);
    } catch (error: any) {
      console.error('Error loading cart:', error);
      const message = error?.response?.data?.message || 'Failed to load cart';

      if (!message.includes('Session expired')) {
        toast.show({
          type: 'error',
          text1: 'Error',
          text2: message,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCart();
  };

  const toggleItemSelection = (itemId: string | number) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  };

  const updateQuantity = async (itemId: string | number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      await cartService.updateCartItem(itemId, newQuantity);

      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
            : item
        )
      );
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to update quantity',
      });
    } finally {
      setUpdatingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId: string | number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartService.removeFromCart(itemId);
              setCartItems(prev => prev.filter(item => item.id !== itemId));

              toast.show({
                type: 'success',
                text1: 'Removed',
                text2: 'Item removed from cart',
              });
            } catch (error: any) {
              console.error('Error removing item:', error);
              toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to remove item',
              });
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to clear your entire cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await cartService.clearCart();
              setCartItems([]);

              toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Cart cleared',
              });
            } catch (error: any) {
              console.error('Error clearing cart:', error);
              toast.show({
                type: 'error',
                text1: 'Error',
                text2: error?.response?.data?.message || 'Failed to clear cart',
              });
            }
          },
        },
      ]
    );
  };

  const goToCheckout = () => {
    if (cartItems.length === 0) {
      toast.show({
        type: 'error',
        text1: 'Cart is empty',
        text2: 'Add some products before checkout',
      });
      return;
    }

    if (selectedItems.size === 0) {
      toast.show({
        type: 'error',
        text1: 'No items selected',
        text2: 'Please select items to checkout',
      });
      return;
    }

    const selected = cartItems.filter(item => selectedItems.has(item.id));
    router.push({
      pathname: '/checkout',
      params: {
        items: JSON.stringify(selected),
        fromCart: 'true'
      }
    });
  };

  const subtotal = cartItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const renderCartItem = ({ item }: { item: CartItem }) => {
    const isUpdating = updatingItems.has(item.id);
    const isSelected = selectedItems.has(item.id);

    return (
      <Card
        marginH-20
        marginB-15
        padding-18
        bg-white
        style={{
          borderRadius: 22,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 5,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? Colors.primaryColor : Colors.grey70,
        }}
      >
        <View row>
          {/* Checkbox */}
          <View center marginR-15>
            <Checkbox
              value={isSelected}
              onValueChange={() => toggleItemSelection(item.id)}
              color={Colors.primaryColor}
              size={24}
            />
          </View>

          {/* Product Image */}
          <View
            style={{
              width: 90,
              height: 90,
              borderRadius: 18,
              overflow: 'hidden',
              backgroundColor: Colors.grey80
            }}
          >
            <Image
              source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/90' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </View>

          {/* Product Info */}
          <View flex marginL-15>
            <Text text70 textColor numberOfLines={2} style={{ fontWeight: '700', lineHeight: 22 }}>
              {item.product.name}
            </Text>
            <Text text80 primaryColor marginT-6 style={{ fontWeight: 'bold', fontSize: 16 }}>
              {formatCurrency(item.price)} ₫
            </Text>

            {/* Quantity Controls */}
            <View row centerV spread marginT-12>
              <View
                row
                centerV
                paddingH-10
                paddingV-6
                style={{
                  backgroundColor: Colors.grey80,
                  borderRadius: 25,
                  borderWidth: 1.5,
                  borderColor: Colors.grey60
                }}
              >
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={isUpdating ? Colors.grey40 : Colors.textColor}
                  />
                </TouchableOpacity>

                <Text text70 marginH-18 style={{ fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating}
                  style={{ padding: 4 }}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={isUpdating ? Colors.grey40 : Colors.textColor}
                  />
                </TouchableOpacity>
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                disabled={isUpdating}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: '#FFEBEE',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="trash-outline" size={22} color={Colors.red30} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View flex bg-white>
        {/* Modern Header */}
        <View
          row
          spread
          centerV
          paddingH-20
          paddingV-18
          bg-white
          style={{
            borderBottomWidth: 1.5,
            borderBottomColor: Colors.grey70
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
              alignItems: 'center'
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
          </TouchableOpacity>

          <View center flex>
            <Text text50 textColor style={{ fontWeight: 'bold' }}>Shopping Cart</Text>
            {cartItems.length > 0 && (
              <Text text90 grey40 marginT-2 style={{ fontWeight: '500' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </Text>
            )}
          </View>

          {cartItems.length > 0 ? (
            <TouchableOpacity
              onPress={handleClearCart}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: '#FFEBEE'
              }}
            >
              <Text text80 style={{ color: Colors.red30, fontWeight: '700' }}>Clear</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Select All Section */}
        {cartItems.length > 0 && (
          <View
            row
            spread
            centerV
            paddingH-20
            paddingV-15
            bg-grey80
            style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey70 }}
          >
            <TouchableOpacity
              row
              centerV
              onPress={toggleSelectAll}
            >
              <View
                width={28}
                height={28}
                center
                br100
                style={{
                  backgroundColor: selectedItems.size === cartItems.length ? Colors.primaryColor : Colors.white,
                  borderWidth: 2,
                  borderColor: selectedItems.size === cartItems.length ? Colors.primaryColor : Colors.grey50
                }}
              >
                {selectedItems.size === cartItems.length && (
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                )}
              </View>
              <Text text70 textColor marginL-12 style={{ fontWeight: '600' }}>Select All</Text>
            </TouchableOpacity>

            <Text text80 primaryColor style={{ fontWeight: '700' }}>
              {selectedItems.size} / {cartItems.length} selected
            </Text>
          </View>
        )}

        {/* Cart Items List */}
        {loading ? (
          <View flex center>
            <ActivityIndicator size="large" color={Colors.primaryColor} />
            <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>
              Loading cart...
            </Text>
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingTop: 20, paddingBottom: 140 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primaryColor]} />
            }
            ListEmptyComponent={
              <View flex center paddingT-80>
                <View
                  width={120}
                  height={120}
                  center
                  br100
                  bg-grey80
                  marginB-25
                >
                  <Ionicons name="cart-outline" size={60} color={Colors.grey40} />
                </View>
                <Text text50 textColor style={{ fontWeight: 'bold' }}>Your Cart is Empty</Text>
                <Text text80 grey40 center marginT-12 marginH-40 style={{ lineHeight: 24 }}>
                  Looks like you haven't added anything to your cart yet
                </Text>
                <Button
                  label="Start Shopping"
                  onPress={() => router.push('/home')}
                  backgroundColor={Colors.primaryColor}
                  marginT-30
                  style={{ paddingHorizontal: 40, height: 54, borderRadius: 16 }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                  enableShadow
                />
              </View>
            }
          />
        )}

        {/* Modern Bottom Checkout Bar */}
        {cartItems.length > 0 && (
          <View
            padding-22
            bg-white
            absB
            left
            right
            style={{
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -5 },
              shadowOpacity: 0.12,
              shadowRadius: 15,
              elevation: 12,
              paddingBottom: 28
            }}
          >
            <View row spread centerV marginB-18>
              <View>
                <Text text80 grey40 style={{ fontWeight: '500' }}>Total Amount</Text>
                <Text text40 primaryColor marginT-4 style={{ fontWeight: 'bold', letterSpacing: 0.3 }}>
                  {formatCurrency(subtotal)} ₫
                </Text>
              </View>

              <View
                paddingH-16
                paddingV-8
                style={{
                  backgroundColor: Colors.grey80,
                  borderRadius: 12
                }}
              >
                <Text text80 grey20 style={{ fontWeight: '600' }}>
                  {selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'}
                </Text>
              </View>
            </View>

            <Button
              label="Proceed to Checkout"
              backgroundColor={Colors.primaryColor}
              onPress={goToCheckout}
              disabled={selectedItems.size === 0}
              style={{ height: 58, borderRadius: 18 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 }}
              enableShadow
            />
          </View>
        )}

        {/* Bottom Navigator */}
        <View style={styles.navigatorContainer}>
          <BottomNavigator activeTab="cart" />
        </View>
      </View>
    </SafeAreaView>
  );
}

function formatCurrency(n: number | null | undefined) {
  if (n == null || isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
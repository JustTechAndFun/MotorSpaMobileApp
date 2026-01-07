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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
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
      <View style={styles.cartItem}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={() => toggleItemSelection(item.id)}
        >
          <Ionicons 
            name={isSelected ? "checkbox" : "square-outline"} 
            size={24} 
            color={isSelected ? "#007AFF" : "#CCC"} 
          />
        </TouchableOpacity>
        <Image 
          source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/80' }} 
          style={styles.productImage}
        />
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.productPrice}>
            {formatCurrency(item.price)} VNĐ
          </Text>
          
          {/* Quantity Controls */}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating}
            >
              <Ionicons name="remove" size={16} color={isUpdating ? '#CCC' : '#333'} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={[styles.quantityButton, isUpdating && styles.quantityButtonDisabled]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating}
            >
              <Ionicons name="add" size={16} color={isUpdating ? '#CCC' : '#333'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.itemActions}>
          <Text style={styles.totalPrice}>
            {formatCurrency(item.totalPrice)} VNĐ
          </Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveItem(item.id)}
            disabled={isUpdating}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
          {cartItems.length === 0 && <View style={{ width: 50 }} />}
        </View>
        
        {/* Select All */}
        {cartItems.length > 0 && (
          <View style={styles.selectAllContainer}>
            <TouchableOpacity 
              style={styles.selectAllButton}
              onPress={toggleSelectAll}
            >
              <Ionicons 
                name={selectedItems.size === cartItems.length ? "checkbox" : "square-outline"} 
                size={24} 
                color={selectedItems.size === cartItems.length ? "#007AFF" : "#CCC"} 
              />
              <Text style={styles.selectAllText}>Select All</Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>
              {selectedItems.size} / {cartItems.length} items
            </Text>
          </View>
        )}

        {/* Cart Items */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color="#CCC" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <Text style={styles.emptySubtext}>Add products to get started</Text>
                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => router.push('/home')}
                >
                  <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Bottom Summary */}
        {cartItems.length > 0 && (
          <View style={styles.bottomSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)} VNĐ</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={goToCheckout}>
              <Text style={styles.checkoutButtonText}>
                Checkout • {formatCurrency(subtotal)} VNĐ
              </Text>
            </TouchableOpacity>
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
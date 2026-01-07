import { useToast } from '@/components/toast';
import { cartService, favoriteService, productService } from '@/services';
import type { Product } from '@/types/api.types';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  View as RNView,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../styles/product-detail-styles';

export default function ProductDetail({ product: propProduct }: { product?: Product }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const toast = useToast();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Product | null>(propProduct || null);
  const [loading, setLoading] = useState(!propProduct);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showQuantitySheet, setShowQuantitySheet] = useState(false);
  
  const flyingImageAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const bottomSheetAnim = useRef(new Animated.Value(0)).current;
  const flyingOpacity = useRef(new Animated.Value(0)).current;
  const flyingScale = useRef(new Animated.Value(1)).current;
  const cartIconRef = useRef<RNView>(null);
  const addToCartButtonRef = useRef<RNView>(null);

  useEffect(() => {
    if (productId && !propProduct) {
      loadProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (product) {
      checkFavoriteStatus();
    }
  }, [product]);

  useEffect(() => {
    Animated.timing(bottomSheetAnim, {
      toValue: showQuantitySheet ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showQuantitySheet]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error: any) {
      console.error('Error loading product:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to load product',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!product) return;
    
    try {
      const status = await favoriteService.checkFavorite(product.id);
      setIsFavorite(status);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!product) return;
    
    setFavoriteLoading(true);
    try {
      await favoriteService.toggleFavorite(product.id, isFavorite);
      setIsFavorite(!isFavorite);
      
      toast.show({
        type: 'success',
        text1: isFavorite ? 'Removed' : 'Added',
        text2: isFavorite 
          ? 'Removed from favorites' 
          : 'Added to favorites',
      });
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to update favorite',
      });
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    
    setAddingToCart(true);
    
    try {
      await cartService.addToCart({ productId: product.id, quantity: 1 });
      
      playFlyingAnimation();
      
      toast.show({
        type: 'success',
        text1: 'Added to cart',
        text2: `${product.name} has been added to cart`,
        position: 'center',
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to add to cart',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product || !product.isAvailable) return;
    
    setQuantity(1);
    setShowQuantitySheet(true);
  };

  const handleBuyNowConfirm = () => {
    if (!product) return;
    
    setShowQuantitySheet(false);
    
    const checkoutItem = {
      id: product.id,
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        price: product.price.toString(),
      },
      quantity: quantity,
      price: product.price,
      totalPrice: product.price * quantity,
    };
    
    setTimeout(() => {
      router.push({
        pathname: '/checkout',
        params: {
          items: JSON.stringify([checkoutItem]),
        },
      });
    }, 300);
  };

  const playFlyingAnimation = () => {
    if (!addToCartButtonRef.current || !cartIconRef.current) return;
    
    addToCartButtonRef.current.measureInWindow((btnX: number, btnY: number, btnWidth: number, btnHeight: number) => {
      cartIconRef.current?.measureInWindow((cartX: number, cartY: number) => {
        const screenWidth = Dimensions.get('window').width;
        const screenHeight = Dimensions.get('window').height;
        
        const startX = btnX + btnWidth / 2 - 25;
        const startY = btnY + btnHeight / 2 - 25;
        
        const endX = cartX - 25;
        const endY = cartY - 25;
        
        flyingImageAnim.setValue({ x: startX, y: startY });
        flyingOpacity.setValue(1);
        flyingScale.setValue(1);
        
        Animated.parallel([
          Animated.timing(flyingImageAnim, {
            toValue: { x: endX, y: endY },
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(flyingScale, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(flyingOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(flyingOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 12, color: '#666' }}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={{ marginTop: 12, color: '#666' }}>Product not found</Text>
          <TouchableOpacity 
            style={{ marginTop: 16, padding: 12, backgroundColor: '#007AFF', borderRadius: 8 }}
            onPress={() => router.back()}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 96 }]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome5 name="arrow-left" size={18} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn}>
                <FontAwesome5 name="search" size={16} color="#333" />
              </TouchableOpacity>
              <View ref={cartIconRef}>
                <TouchableOpacity 
                  style={styles.iconBtn}
                  onPress={() => router.push('/cart')}
                >
                  <FontAwesome5 name="shopping-cart" size={16} color="#333" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={handleToggleFavorite}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <ActivityIndicator size="small" color="#333" />
                ) : (
                  <FontAwesome5 
                    name="heart" 
                    size={16} 
                    color={isFavorite ? '#e74c3c' : '#333'} 
                    solid={isFavorite} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: product.imageUrl }} 
              style={styles.productImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.price}>VND. {product.price.toLocaleString()}</Text>

            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{product.name}</Text>
                {product.category && (
                  <Text style={styles.store}>{product.category.name}</Text>
                )}
              </View>
              <TouchableOpacity 
                onPress={handleToggleFavorite}
                disabled={favoriteLoading}
              >
                {favoriteLoading ? (
                  <ActivityIndicator size="small" color="#999" />
                ) : (
                  <FontAwesome5 
                    name="heart" 
                    size={18} 
                    color={isFavorite ? '#e74c3c' : '#999'} 
                    solid={isFavorite} 
                  />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.infoTitle}>Stock</Text>
                  <Text style={styles.infoValue}>{product.stock}</Text>
                </View>
                <View>
                  <Text style={styles.infoTitle}>Status</Text>
                  <Text style={[styles.infoValue, { color: product.isAvailable ? '#4caf50' : '#f44336' }]}>
                    {product.isAvailable ? 'Available' : 'Out of Stock'}
                  </Text>
                </View>
              </View>

              <View style={styles.descBlock}>
                <Text style={styles.descTitle}>Description</Text>
                <Text style={styles.descText}>{product.description}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <View ref={addToCartButtonRef} style={{ flex: 1 }}>
            <TouchableOpacity 
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              disabled={!product.isAvailable || addingToCart}
            >
            {addingToCart ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <>
                <FontAwesome5 name="shopping-cart" size={16} color="#007AFF" style={{ marginRight: 8 }} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.footerBuyBtn}
            onPress={handleBuyNow}
            disabled={!product.isAvailable}
          >
            <Text style={styles.buyText}>
              {product.isAvailable ? 'Buy Now' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Flying Image Animation */}
        <Animated.View
          style={[
            styles.flyingImage,
            {
              opacity: flyingOpacity,
              transform: [
                { translateX: flyingImageAnim.x },
                { translateY: flyingImageAnim.y },
                { scale: flyingScale },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Image 
            source={{ uri: product.imageUrl }} 
            style={styles.flyingImageContent}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Bottom Sheet Overlay */}
        {showQuantitySheet && (
          <TouchableOpacity 
            style={styles.sheetOverlay}
            activeOpacity={1}
            onPress={() => setShowQuantitySheet(false)}
          />
        )}

        {/* Quantity Bottom Sheet */}
        <Animated.View
          style={[
            styles.quantitySheet,
            {
              transform: [
                {
                  translateY: bottomSheetAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [500, 0],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={showQuantitySheet ? 'auto' : 'none'}
        >
          <View style={styles.sheetHandle} />
          
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Select Quantity</Text>
            
            <View style={styles.sheetProduct}>
              <Image 
                source={{ uri: product.imageUrl }} 
                style={styles.sheetProductImage}
                resizeMode="contain"
              />
              <View style={styles.sheetProductInfo}>
                <Text style={styles.sheetProductName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.sheetProductPrice}>
                  VND. {product.price.toLocaleString()}
                </Text>
                <Text style={styles.sheetProductStock}>
                  Stock: {product.stock}
                </Text>
              </View>
            </View>

            <View style={styles.sheetQuantitySection}>
              <Text style={styles.sheetQuantityLabel}>Quantity</Text>
              <View style={styles.sheetQuantityControl}>
                <TouchableOpacity
                  style={styles.sheetQuantityButton}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={24} color={quantity <= 1 ? '#ccc' : '#333'} />
                </TouchableOpacity>
                <Text style={styles.sheetQuantityText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.sheetQuantityButton}
                  onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons name="add" size={24} color={quantity >= product.stock ? '#ccc' : '#333'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sheetFooter}>
              <View style={styles.sheetTotal}>
                <Text style={styles.sheetTotalLabel}>Total</Text>
                <Text style={styles.sheetTotalAmount}>
                  VND. {(product.price * quantity).toLocaleString()}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.sheetConfirmButton}
                onPress={handleBuyNowConfirm}
              >
                <Text style={styles.sheetConfirmText}>Confirm & Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

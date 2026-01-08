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
  StatusBar,
} from 'react-native';
import { Text, View, Button, Colors, Spacings, Card, Badge, LoaderScreen } from 'react-native-ui-lib';
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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>
            Loading product...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
        <View flex center paddingH-40>
          <View
            width={100}
            height={100}
            center
            br100
            bg-grey80
            marginB-25
          >
            <Ionicons name="cube-outline" size={50} color={Colors.grey40} />
          </View>
          <Text text60 textColor center style={{ fontWeight: 'bold' }}>
            Product Not Found
          </Text>
          <Text text80 grey40 center marginT-10 style={{ lineHeight: 24 }}>
            We couldn't find the product you're looking for
          </Text>
          <Button
            label="Go Back"
            onPress={() => router.back()}
            backgroundColor={Colors.primaryColor}
            marginT-30
            style={{ paddingHorizontal: 40, height: 50, borderRadius: 15 }}
            labelStyle={{ fontWeight: 'bold' }}
            enableShadow
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View flex bg-white>
      <StatusBar barStyle="dark-content" />
      <View flex>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Modern Header with Gradient Overlay */}
          <View>
            {/* Header Actions */}
            <View
              row
              spread
              centerV
              paddingH-20
              paddingT-50
              paddingB-15
              absT
              left
              right
              style={{ zIndex: 10 }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                }}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
              </TouchableOpacity>

              <View row centerV>
                <TouchableOpacity
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                  }}
                  onPress={() => router.push('/cart')}
                >
                  <View ref={cartIconRef}>
                    <Ionicons name="cart-outline" size={24} color={Colors.textColor} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleToggleFavorite}
                  disabled={favoriteLoading}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                  }}
                >
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorite ? Colors.red30 : Colors.textColor}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Product Image Section with modern design */}
            <View
              center
              paddingT-80
              paddingB-40
              style={{
                backgroundColor: Colors.grey80,
                borderBottomLeftRadius: 35,
                borderBottomRightRadius: 35,
              }}
            >
              <Image
                source={{ uri: product.imageUrl }}
                style={{ width: '90%', height: 320 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Product Info Section */}
          <View padding-25>
            {/* Price and Stock Status */}
            <View row spread centerV marginB-15>
              <View flex-1>
                <Text text80 grey40 style={{ fontWeight: '500' }}>Price</Text>
                <Text text40 primaryColor marginT-5 style={{ fontWeight: 'bold', letterSpacing: 0.3 }}>
                  {product.price.toLocaleString()} ₫
                </Text>
              </View>

              {product.isAvailable ? (
                <View
                  paddingH-16
                  paddingV-10
                  style={{
                    backgroundColor: '#E8F5E9',
                    borderRadius: 15,
                    borderWidth: 1.5,
                    borderColor: '#4CAF50'
                  }}
                >
                  <Text text80 style={{ color: '#2E7D32', fontWeight: 'bold' }}>✓ In Stock</Text>
                </View>
              ) : (
                <View
                  paddingH-16
                  paddingV-10
                  style={{
                    backgroundColor: '#FFEBEE',
                    borderRadius: 15,
                    borderWidth: 1.5,
                    borderColor: '#F44336'
                  }}
                >
                  <Text text80 style={{ color: '#C62828', fontWeight: 'bold' }}>Out of Stock</Text>
                </View>
              )}
            </View>

            {/* Product Name */}
            <Text text50 textColor style={{ fontWeight: 'bold', lineHeight: 32, letterSpacing: 0.2 }}>
              {product.name}
            </Text>

            {/* Rating and Stock Count */}
            <View
              row
              centerV
              marginT-15
              paddingH-15
              paddingV-10
              style={{
                backgroundColor: Colors.grey80,
                borderRadius: 12,
                alignSelf: 'flex-start'
              }}
            >
              <View row centerV>
                <Ionicons name="star" size={18} color="#FFB800" />
                <Text text80 grey20 marginL-6 style={{ fontWeight: '700' }}>4.8</Text>
                <Text text90 grey40 marginL-4>(120+)</Text>
              </View>
              <View width={1.5} height={16} bg-grey60 marginH-15 />
              <Text text80 grey30 style={{ fontWeight: '600' }}>
                {product.stock} units left
              </Text>
            </View>

            {/* Description Section */}
            <View marginT-30>
              <View row centerV marginB-15>
                <View
                  width={4}
                  height={20}
                  bg-primaryColor
                  marginR-10
                  style={{ borderRadius: 2 }}
                />
                <Text text60 textColor style={{ fontWeight: 'bold' }}>Description</Text>
              </View>
              <Text text80 grey30 style={{ lineHeight: 26, letterSpacing: 0.1 }}>
                {product.description || "This is a premium quality product from MotorSpa. We ensure the best quality and performance for your motorcycle."}
              </Text>
            </View>

            {/* Specifications Card */}
            <View marginT-30>
              <View row centerV marginB-15>
                <View
                  width={4}
                  height={20}
                  bg-primaryColor
                  marginR-10
                  style={{ borderRadius: 2 }}
                />
                <Text text60 textColor style={{ fontWeight: 'bold' }}>Specifications</Text>
              </View>

              <Card
                padding-20
                bg-white
                style={{
                  borderRadius: 18,
                  borderWidth: 1.5,
                  borderColor: Colors.grey70,
                  elevation: 0
                }}
              >
                <View row spread centerV paddingV-12 style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey70 }}>
                  <Text text80 grey40 style={{ fontWeight: '500' }}>Brand</Text>
                  <Text text80 textColor style={{ fontWeight: '700' }}>MotorSpa Genuine</Text>
                </View>
                <View row spread centerV paddingV-12 style={{ borderBottomWidth: 1, borderBottomColor: Colors.grey70 }}>
                  <Text text80 grey40 style={{ fontWeight: '500' }}>Category</Text>
                  <Text text80 textColor style={{ fontWeight: '700' }}>
                    {product.category?.name || "General"}
                  </Text>
                </View>
                <View row spread centerV paddingV-12>
                  <Text text80 grey40 style={{ fontWeight: '500' }}>Warranty</Text>
                  <Text text80 primaryColor style={{ fontWeight: '700' }}>6 Months</Text>
                </View>
              </Card>
            </View>
          </View>
        </ScrollView>

        {/* Modern Footer Actions */}
        <View
          row
          padding-20
          bg-white
          absB
          left
          right
          style={{
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 15,
            paddingBottom: 25
          }}
        >
          <View flex marginR-12>
            <Button
              label={addingToCart ? "Adding..." : "Add to Cart"}
              onPress={handleAddToCart}
              disabled={!product.isAvailable || addingToCart}
              backgroundColor={Colors.white}
              color={Colors.primaryColor}
              outline
              outlineColor={Colors.primaryColor}
              outlineWidth={2}
              style={{ height: 56, borderRadius: 18 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
              ref={addToCartButtonRef}
            />
          </View>

          <View flex-2>
            <Button
              label="Buy Now"
              onPress={handleBuyNow}
              disabled={!product.isAvailable}
              backgroundColor={Colors.primaryColor}
              style={{ height: 56, borderRadius: 18 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }}
              enableShadow
            />
          </View>
        </View>
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
  );
}

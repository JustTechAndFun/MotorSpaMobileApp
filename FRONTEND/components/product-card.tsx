import { favoriteService } from '@/services';
import type { Product } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Card, Button, Colors, Image as UILibImage } from 'react-native-ui-lib';
import { Image, TouchableOpacity } from 'react-native';
import { styles } from '../styles/product-card-styles';

interface ProductCardProps {
  product?: Product;
  // Legacy props for backward compatibility
  name?: string;
  price?: string;
  image?: any;
  rating?: number;
  sold?: number;
  showFavoriteButton?: boolean;
  onFavoriteChange?: () => void;
}

export default function ProductCard({
  product,
  name,
  price,
  image,
  rating,
  sold,
  showFavoriteButton = false,
  onFavoriteChange,
}: ProductCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(false);

  // Use product data if available, otherwise use legacy props
  const displayName = product?.name || name || '';
  const displayPrice = product ? `${product.price.toLocaleString()} VND` : price || '';
  const displayImage = product?.imageUrl ? { uri: product.imageUrl } : image;
  const productId = product?.id;

  useEffect(() => {
    if (showFavoriteButton && productId) {
      checkFavoriteStatus();
    }
  }, [productId, showFavoriteButton]);

  const checkFavoriteStatus = async () => {
    if (!productId) return;

    try {
      const status = await favoriteService.checkFavorite(productId);
      setIsFavorite(status);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation();

    if (!productId) return;

    setCheckingFavorite(true);
    try {
      await favoriteService.toggleFavorite(productId, isFavorite);
      setIsFavorite(!isFavorite);

      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setCheckingFavorite(false);
    }
  };

  const handlePress = () => {
    if (productId) {
      router.push(`/product_detail?productId=${productId}`);
    } else {
      router.push('/product_detail');
    }
  };

  return (
    <Card
      marginB-18
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: Colors.white,
        elevation: 4,
        shadowColor: Colors.grey10,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
      onPress={handlePress}
    >
      {/* Image Container */}
      <View style={{ height: 180, backgroundColor: Colors.grey80, position: 'relative' }}>
        <Image source={displayImage} style={{ width: '100%', height: '100%' }} resizeMode="cover" />

        {/* Gradient Overlay */}
        <View
          absB
          left
          right
          height={60}
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          }}
        />

        {showFavoriteButton && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(255,255,255,0.95)',
              padding: 10,
              borderRadius: 25,
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
            }}
            onPress={handleToggleFavorite}
            disabled={checkingFavorite}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? Colors.red30 : Colors.grey20}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View padding-15>
        <Text text70 numberOfLines={2} textColor style={{ fontWeight: '600', lineHeight: 22 }}>
          {displayName}
        </Text>

        <View row spread centerV marginT-10>
          <View>
            <Text text80 primaryColor style={{ fontWeight: 'bold', fontSize: 17 }}>
              {displayPrice}
            </Text>
          </View>

          {(rating !== undefined || sold !== undefined) && (
            <View row centerV>
              {rating !== undefined && (
                <View
                  row
                  centerV
                  paddingH-8
                  paddingV-4
                  br100
                  style={{ backgroundColor: '#FFF9E6' }}
                >
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text text90 marginL-4 style={{ color: '#FF8C00', fontWeight: '700' }}>
                    {rating.toFixed(1)}
                  </Text>
                </View>
              )}
              {sold !== undefined && rating === undefined && (
                <Text text90 grey40 style={{ fontWeight: '500' }}>
                  Sold {sold}
                </Text>
              )}
            </View>
          )}
        </View>

        {sold !== undefined && rating !== undefined && (
          <Text text90 grey40 marginT-6 style={{ fontWeight: '500' }}>
            {sold} sold
          </Text>
        )}
      </View>
    </Card>
  );
}

import { favoriteService } from '@/services';
import type { Product } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
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
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image source={displayImage} style={styles.image} resizeMode="contain" />
        
        {showFavoriteButton && (
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            disabled={checkingFavorite}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#ff3b30" : "#666"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{displayName}</Text>
        <Text style={styles.price}>{displayPrice}</Text>
        
        {(rating !== undefined || sold !== undefined) && (
          <View style={styles.ratingContainer}>
            {rating !== undefined && (
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            )}
            {sold !== undefined && (
              <Text style={styles.soldText}>Terjual {sold}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

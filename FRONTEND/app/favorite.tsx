import { useToast } from '@/components/toast';
import { favoriteService } from '@/services';
import type { Product } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import BottomNavigator from '../components/bottom-navigator';
import ProductCard from '../components/product-card';

export default function FavoriteProducts() {
  const router = useRouter();
  const toast = useToast();

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterFavorites();
  }, [searchQuery, favorites]);

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
      setFilteredFavorites(data);
    } catch (error: any) {
      console.error('Error loading favorites:', error);
      const message = error?.response?.data?.message || 'Failed to load favorites';
      
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

  const filterFavorites = () => {
    if (!searchQuery.trim()) {
      setFilteredFavorites(favorites);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = favorites.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
    setFilteredFavorites(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  const handleRemoveFavorite = async (productId: string | number) => {
    try {
      await favoriteService.removeFromFavorites(productId);
      
      toast.show({
        type: 'success',
        text1: 'Removed',
        text2: 'Product removed from favorites',
      });
      
      loadFavorites();
    } catch (error: any) {
      console.error('Error removing favorite:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to remove favorite',
      });
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <View style={styles.productWrapper}>
        <ProductCard 
          product={item}
          showFavoriteButton
          onFavoriteChange={() => handleRemoveFavorite(item.id)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Favorite Products</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#666" />
          <TextInput 
            placeholder="Search favorites" 
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        {/* Product List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : (
          <FlatList
            data={filteredFavorites}
            renderItem={renderProduct}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={styles.columnWrapper}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No products found' : 'No favorite products yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Add products to favorites by tapping the heart icon'}
                </Text>
              </View>
            }
          />
        )}

        {/* Bottom Navigator */}
        <View style={styles.navigatorContainer}>
          <BottomNavigator activeTab="favorite" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  navigatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

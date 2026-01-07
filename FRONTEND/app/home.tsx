import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, View } from 'react-native-ui-lib';
import Banner from '../components/banner';
import BottomNavigator from '../components/bottom-navigator';
import Category from '../components/category';
import ProductCard from '../components/product-card';
import SearchHeader from '../components/search-header';
import { productService } from '../services';
import { styles } from '../styles/home-styles';
import type { Product } from '../types/api.types';

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(6);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const products = await productService.getAvailableProducts();
      setAllProducts(products);
      setDisplayedProducts(products.slice(0, 6));
      setCurrentIndex(6);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    
    setTimeout(() => {
      const nextIndex = currentIndex + 9;
      const newProducts = allProducts.slice(0, nextIndex);
      setDisplayedProducts(newProducts);
      setCurrentIndex(nextIndex);
      setLoadingMore(false);
    }, 300);
  };

  const hasMore = currentIndex < allProducts.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.row}>
            <Banner />
          </View>

          <View style={styles.row}>
            <SearchHeader />
          </View>

          <View style={styles.row}>
            <Category />
          </View>

          <View style={styles.row}>
            <View style={styles.productsSection}>
              <Text style={styles.sectionTitle}>All Products</Text>
              
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                </View>
              ) : (
                <>
                  <View style={styles.productsGrid}>
                    {displayedProducts.map((product) => (
                      <View key={String(product.id)} style={styles.productCardWrapper}>
                        <ProductCard product={product} />
                      </View>
                    ))}
                  </View>

                  {hasMore && (
                    <Button
                      label={loadingMore ? undefined : "View More"}
                      onPress={handleLoadMore}
                      disabled={loadingMore}
                      backgroundColor="#82b440"
                      style={styles.loadMoreButton}
                      borderRadius={12}
                    >
                      {loadingMore && <ActivityIndicator size="small" color="#fff" />}
                    </Button>
                  )}
                </>
              )}
            </View>
          </View>
          
          <View style={styles.bottomPadding} />
        </ScrollView>
        
        <View style={styles.navigatorContainer}>
          <BottomNavigator activeTab="home" />
        </View>
      </View>
    </SafeAreaView>
  );
}

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, View, Colors } from 'react-native-ui-lib';
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Banner />

          <SearchHeader />

          <Category />

          <View style={styles.productsSection}>
            {/* Modern Section Header */}
            <View row spread centerV marginB-20 paddingH-5>
              <View>
                <Text text50 textColor style={{ fontWeight: 'bold', letterSpacing: 0.3 }}>
                  All Products
                </Text>
                <View
                  width={50}
                  height={4}
                  bg-primaryColor
                  marginT-6
                  style={{ borderRadius: 2 }}
                />
              </View>
              {!loading && allProducts.length > 0 && (
                <View
                  paddingH-12
                  paddingV-6
                  br100
                  style={{ backgroundColor: Colors.grey80 }}
                >
                  <Text text80 grey20 style={{ fontWeight: '700' }}>
                    {allProducts.length} items
                  </Text>
                </View>
              )}
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primaryColor} />
                <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>
                  Loading products...
                </Text>
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
                    label={loadingMore ? "Loading..." : "View More Products"}
                    onPress={handleLoadMore}
                    disabled={loadingMore}
                    backgroundColor={Colors.white}
                    color={Colors.primaryColor}
                    outline
                    outlineColor={Colors.primaryColor}
                    outlineWidth={2}
                    style={{
                      marginTop: 25,
                      marginBottom: 35,
                      height: 56,
                      borderRadius: 18
                    }}
                    labelStyle={{ fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 }}
                  />
                )}
              </>
            )}
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

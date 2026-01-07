import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import ProductCard from '../components/product-card';
import { categoryService, productService } from '../services';
import { styles } from '../styles/category-page-styles';
import type { Category, Product } from '../types/api.types';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const iconSize = isTablet ? 28 : 24;

export default function CategoryPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categoryId = params.categoryId as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('Category');

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    filterProducts();
  }, [selectedSubCategory, searchQuery, products]);

  const loadData = async () => {
    try {
      setLoading(true);

      if (categoryId) {
        const category = await categoryService.getCategoryById(categoryId);
        setCategoryName(category.name);

        const productsData = await productService.getProductsByCategory(categoryId);
        setProducts(productsData);
        setFilteredProducts(productsData);

        const subCats = await categoryService.getCategoriesByParent(categoryId);
        setSubCategories(subCats);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedSubCategory !== 'All') {
      filtered = filtered.filter(p => 
        String(p.subCategoryId) === selectedSubCategory
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSubCategorySelect = (subCatId: string) => {
    setSelectedSubCategory(subCatId);
    setIsDropdownOpen(false);
  };

  const getSelectedCategoryName = () => {
    if (selectedSubCategory === 'All') return 'All Products';
    const subCat = subCategories.find(c => String(c.id) === selectedSubCategory);
    return subCat?.name || 'All Products';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={iconSize} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{categoryName}</Text>
          
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <Ionicons name="cart" size={iconSize} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={isTablet ? 22 : 20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Subcategory Dropdown */}
        {subCategories.length > 0 && (
          <>
            <TouchableOpacity 
              style={styles.dropdownContainer}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.dropdownLabel}>Filter by Type</Text>
              <View style={styles.dropdownButton}>
                <Text style={styles.dropdownText}>{getSelectedCategoryName()}</Text>
                <Ionicons 
                  name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#333" 
                />
              </View>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <View style={styles.dropdownMenu}>
                <ScrollView style={styles.dropdownScroll}>
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      selectedSubCategory === 'All' && styles.dropdownItemActive
                    ]}
                    onPress={() => handleSubCategorySelect('All')}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedSubCategory === 'All' && styles.dropdownItemTextActive
                    ]}>
                      All Products
                    </Text>
                  </TouchableOpacity>

                  {subCategories.map((subCat) => (
                    <TouchableOpacity
                      key={String(subCat.id)}
                      style={[
                        styles.dropdownItem,
                        selectedSubCategory === String(subCat.id) && styles.dropdownItemActive
                      ]}
                      onPress={() => handleSubCategorySelect(String(subCat.id))}
                    >
                      <Text style={[
                        styles.dropdownItemText,
                        selectedSubCategory === String(subCat.id) && styles.dropdownItemTextActive
                      ]}>
                        {subCat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}
      </View>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          numColumns={2}
          key={2}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.productsGrid}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.productCardWrapper}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

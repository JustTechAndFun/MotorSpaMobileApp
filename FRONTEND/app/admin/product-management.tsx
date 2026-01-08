import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { categoryService, productService } from '@/services';
import {
  Category,
  CreateProductRequest,
  Product,
} from '@/types/api.types';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Card, Colors } from 'react-native-ui-lib';

export default function AdminProductManagementScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    subCategoryId: '',
    imageUrl: '',
    isAvailable: true,
    stock: 0,
  });

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      toast.show({
        type: 'error',
        text1: 'Access Denied',
        text2: 'You do not have permission to access this page',
      });
      router.back();
    }
  }, [currentUser]);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (error: any) {
      console.error('Error loading products:', error);
      const message = error?.response?.data?.message || 'Failed to load products';

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

  const loadCategories = useCallback(async () => {
    try {
      const data = await categoryService.getRootCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  }, []);

  const loadSubCategories = useCallback(async (categoryId: string) => {
    try {
      const data = await categoryService.getCategoriesByParent(categoryId);
      setSubCategories(data);
    } catch (error: any) {
      console.error('Error loading subcategories:', error);
      setSubCategories([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadSubCategories(selectedCategoryId);
    } else {
      setSubCategories([]);
    }
  }, [selectedCategoryId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setSelectedCategoryId('');
    setSubCategories([]);
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      subCategoryId: '',
      imageUrl: '',
      isAvailable: true,
      stock: 0,
    });
    setShowModal(true);
  };

  const handleEdit = async (product: Product) => {
    setEditingProduct(product);

    if (product.categoryId) {
      setSelectedCategoryId(String(product.categoryId));
      await loadSubCategories(String(product.categoryId));
    }

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId || '',
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      stock: product.stock,
    });
    setShowModal(true);
  };

  const handleDelete = (product: Product) => {
    setEditingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!editingProduct) return;

    try {
      await productService.deleteProduct(editingProduct.id);

      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Product deleted successfully',
      });

      setShowDeleteModal(false);
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to delete product',
      });
    }
  };

  const handleSubmit = async () => {

    if (!formData.name.trim()) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Product name is required' });
      return;
    }
    if (!formData.categoryId) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Category is required' });
      return;
    }
    if (formData.price <= 0) {
      toast.show({ type: 'error', text1: 'Error', text2: 'Price must be greater than 0' });
      return;
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Product updated successfully',
        });
      } else {
        await productService.createProduct(formData);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Product created successfully',
        });
      }

      setShowModal(false);
      loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to save product',
      });
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Card
      enableShadow
      elevation={2}
      style={{
        marginBottom: 16,
        borderRadius: 18,
        backgroundColor: 'white',
        overflow: 'hidden'
      }}
    >
      <View style={{ flexDirection: 'row', padding: 16 }}>
        {/* Product Image */}
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: 100,
            height: 100,
            borderRadius: 14,
            backgroundColor: Colors.grey80
          }}
        />

        {/* Product Info */}
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text text70 style={{ fontWeight: 'bold', color: Colors.textColor, marginBottom: 4 }}>{item.name}</Text>
          <Text text90 style={{ color: Colors.grey50, marginBottom: 8 }} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text text70 style={{ fontWeight: 'bold', color: Colors.primaryColor, marginRight: 12 }}>
              {item.price.toLocaleString()} VND
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="inventory" size={14} color={Colors.grey50} />
              <Text text90 style={{ color: Colors.grey50, marginLeft: 4 }}>Stock: {item.stock}</Text>
            </View>
          </View>

          {/* Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: item.isAvailable ? Colors.primaryColor : Colors.red30,
                opacity: 0.15,
                borderWidth: 1,
                borderColor: item.isAvailable ? Colors.primaryColor : Colors.red30
              }}
            >
              <Text text90 style={{ color: item.isAvailable ? Colors.primaryColor : Colors.red30, fontWeight: 'bold' }}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>

            {item.category && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: Colors.blue30,
                  opacity: 0.15,
                  borderWidth: 1,
                  borderColor: Colors.blue30
                }}
              >
                <Text text90 style={{ color: Colors.blue30, fontWeight: 'bold' }}>{item.category.name}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: Colors.blue30,
                gap: 6
              }}
            >
              <MaterialIcons name="edit" size={16} color="white" />
              <Text text90 white style={{ fontWeight: 'bold' }}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: Colors.red30,
                gap: 6
              }}
            >
              <MaterialIcons name="delete" size={16} color="white" />
              <Text text90 white style={{ fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.grey80 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />

        {/* Modern Header */}
        <View style={{ paddingTop: 5, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: 'white' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: Colors.grey80,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MaterialIcons name="arrow-back-ios" size={18} color={Colors.textColor} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
            <Text text50 style={{ fontWeight: 'bold', color: Colors.textColor }}>Product Management</Text>
            <View style={{ width: 40 }} />
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 marginT-10 style={{ color: Colors.grey50 }}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.grey80 }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: Colors.grey80 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />

        {/* Modern Header */}
        <View style={{ paddingBottom: 14, paddingHorizontal: 5, backgroundColor: 'white' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.grey80,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <MaterialIcons name="arrow-back-ios" size={18} color={Colors.textColor} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <Text text50 style={{ fontWeight: 'bold', color: Colors.textColor }}>Product Management</Text>
          <TouchableOpacity
            onPress={handleCreate}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.primaryColor,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 4
            }}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{
          paddingTop: 16,
          paddingHorizontal: 5,
          paddingBottom: 100
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primaryColor]} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <MaterialIcons name="inventory-2" size={50} color={Colors.grey60} />
            </View>
            <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor, marginBottom: 8 }}>No products found</Text>
            <Text text80 style={{ color: Colors.grey50, marginBottom: 24 }}>Start by creating your first product</Text>
            <TouchableOpacity
              onPress={handleCreate}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 32,
                borderRadius: 14,
                backgroundColor: Colors.primaryColor,
                shadowColor: Colors.primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4
              }}
            >
              <Text text70 white style={{ fontWeight: 'bold' }}>Create Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%'
            }}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: Colors.grey80
              }}
            >
              <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor }}>
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: Colors.grey80,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <MaterialIcons name="close" size={20} color={Colors.textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
              {/* Product Name */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Product Name *</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter product name"
                  placeholderTextColor={Colors.grey50}
                />
              </View>

              {/* Description */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Description *</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor,
                    minHeight: 100,
                    textAlignVertical: 'top'
                  }}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter description"
                  placeholderTextColor={Colors.grey50}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Price */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Price (VND) *</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={String(formData.price)}
                  onChangeText={(text) => setFormData({ ...formData, price: Number(text) || 0 })}
                  placeholder="0"
                  placeholderTextColor={Colors.grey50}
                  keyboardType="numeric"
                />
              </View>

              {/* Stock */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Stock *</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={String(formData.stock)}
                  onChangeText={(text) => setFormData({ ...formData, stock: Number(text) || 0 })}
                  placeholder="0"
                  placeholderTextColor={Colors.grey50}
                  keyboardType="numeric"
                />
              </View>

              {/* Parent Category */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Category *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={String(cat.id)}
                      onPress={() => {
                        setFormData({ ...formData, categoryId: cat.id, subCategoryId: '' });
                        setSelectedCategoryId(String(cat.id));
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: String(formData.categoryId) === String(cat.id) ? Colors.primaryColor : Colors.grey80
                      }}
                    >
                      <Text
                        text80
                        style={{
                          color: String(formData.categoryId) === String(cat.id) ? 'white' : Colors.textColor,
                          fontWeight: '600'
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Subcategory */}
              {subCategories.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Subcategory (Optional)</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => setFormData({ ...formData, subCategoryId: '' })}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: !formData.subCategoryId ? Colors.primaryColor : Colors.grey80
                      }}
                    >
                      <Text
                        text80
                        style={{
                          color: !formData.subCategoryId ? 'white' : Colors.textColor,
                          fontWeight: '600'
                        }}
                      >
                        None
                      </Text>
                    </TouchableOpacity>
                    {subCategories.map((cat) => (
                      <TouchableOpacity
                        key={String(cat.id)}
                        onPress={() => setFormData({ ...formData, subCategoryId: cat.id })}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: String(formData.subCategoryId) === String(cat.id) ? Colors.primaryColor : Colors.grey80
                        }}
                      >
                        <Text
                          text80
                          style={{
                            color: String(formData.subCategoryId) === String(cat.id) ? 'white' : Colors.textColor,
                            fontWeight: '600'
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Image URL */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Image URL *</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={Colors.grey50}
                />
                {formData.imageUrl && (
                  <Image
                    source={{ uri: formData.imageUrl }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: 14,
                      marginTop: 12,
                      backgroundColor: Colors.grey80
                    }}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Is Available */}
              <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor }}>Available for purchase</Text>
                <Switch
                  value={formData.isAvailable}
                  onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
                  trackColor={{ false: Colors.grey60, true: Colors.primaryColor }}
                  thumbColor="white"
                />
              </View>

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 14,
                    backgroundColor: Colors.grey80,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text text70 style={{ fontWeight: 'bold', color: Colors.textColor }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    borderRadius: 14,
                    backgroundColor: Colors.primaryColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: Colors.primaryColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6
                  }}
                >
                  <Text text70 white style={{ fontWeight: 'bold' }}>
                    {editingProduct ? 'Update' : 'Create'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' }}>
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: Colors.red30,
                opacity: 0.15,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20
              }}
            >
              <MaterialIcons name="delete-outline" size={36} color={Colors.red30} />
            </View>
            <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor, marginBottom: 8, textAlign: 'center' }}>Delete Product</Text>
            <Text text80 style={{ color: Colors.grey50, marginBottom: 24, textAlign: 'center' }}>
              Are you sure you want to delete "{editingProduct?.name}"? This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(false)}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: Colors.grey80,
                  alignItems: 'center'
                }}
              >
                <Text text70 style={{ fontWeight: 'bold', color: Colors.textColor }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: Colors.red30,
                  alignItems: 'center',
                  shadowColor: Colors.red30,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4
                }}
              >
                <Text text70 white style={{ fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
}

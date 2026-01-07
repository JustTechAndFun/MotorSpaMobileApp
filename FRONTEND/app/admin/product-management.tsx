import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { categoryService, productService } from '@/services';
import {
  Category,
  CreateProductRequest,
  Product,
} from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';

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
    <View style={styles.productCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>
            VND. {item.price.toLocaleString()}
          </Text>
          <Text style={styles.productStock}>
            Stock: {item.stock}
          </Text>
        </View>

        <View style={styles.productMeta}>
          <View style={[styles.badge, item.isAvailable ? styles.badgeSuccess : styles.badgeDanger]}>
            <Text style={styles.badgeText}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
          </View>
          
          {item.category && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category.name}</Text>
            </View>
          )}
          
          {item.subCategory && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.subCategory.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <Ionicons name="pencil" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Management</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
              <Text style={styles.emptyButtonText}>Create First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Create Product'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Product Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Enter product name"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Enter description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Price */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Price (VND) *</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.price)}
                  onChangeText={(text) => setFormData({ ...formData, price: Number(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              {/* Stock */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Stock *</Text>
                <TextInput
                  style={styles.input}
                  value={String(formData.stock)}
                  onChangeText={(text) => setFormData({ ...formData, stock: Number(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              {/* Parent Category */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categorySelector}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={String(cat.id)}
                      style={[
                        styles.categoryOption,
                        String(formData.categoryId) === String(cat.id) && styles.categoryOptionActive
                      ]}
                      onPress={() => {
                        setFormData({ ...formData, categoryId: cat.id, subCategoryId: '' });
                        setSelectedCategoryId(String(cat.id));
                      }}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        String(formData.categoryId) === String(cat.id) && styles.categoryOptionTextActive
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Subcategory */}
              {subCategories.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Subcategory (Optional)</Text>
                  <View style={styles.categorySelector}>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        !formData.subCategoryId && styles.categoryOptionActive
                      ]}
                      onPress={() => setFormData({ ...formData, subCategoryId: '' })}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        !formData.subCategoryId && styles.categoryOptionTextActive
                      ]}>
                        None
                      </Text>
                    </TouchableOpacity>
                    {subCategories.map((cat) => (
                      <TouchableOpacity
                        key={String(cat.id)}
                        style={[
                          styles.categoryOption,
                          String(formData.subCategoryId) === String(cat.id) && styles.categoryOptionActive
                        ]}
                        onPress={() => setFormData({ ...formData, subCategoryId: cat.id })}
                      >
                        <Text style={[
                          styles.categoryOptionText,
                          String(formData.subCategoryId) === String(cat.id) && styles.categoryOptionTextActive
                        ]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Image URL */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Image URL *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <Image 
                    source={{ uri: formData.imageUrl }} 
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
              </View>

              {/* Is Available */}
              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.label}>Available</Text>
                  <Switch
                    value={formData.isAvailable}
                    onValueChange={(value) => setFormData({ ...formData, isAvailable: value })}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>
                  {editingProduct ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Ionicons name="warning" size={48} color="#ff3b30" />
            <Text style={styles.deleteTitle}>Delete Product?</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete "{editingProduct?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteConfirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.submitButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  productStock: {
    fontSize: 14,
    color: '#666',
  },
  productMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeSuccess: {
    backgroundColor: '#4caf50',
  },
  badgeDanger: {
    backgroundColor: '#ff3b30',
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  categoryOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#333',
  },
  categoryOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  deleteModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteConfirmButton: {
    backgroundColor: '#ff3b30',
  },
});

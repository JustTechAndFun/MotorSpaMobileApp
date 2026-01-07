import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { categoryService } from '@/services';
import { styles } from '@/styles/admin-category-management-styles';
import {
  Category,
  CreateCategoryRequest,
} from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';

export default function AdminCategoryManagementScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    parentId: '',
    isActive: true,
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

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      const message = error?.response?.data?.message || 'Failed to load categories';
      
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

  const loadChildrenIfNeeded = async (parentId: string | number) => {
    try {
      const existingChildren = getChildCategories(parentId);
      if (existingChildren.length > 0) return;

      const children = await categoryService.getCategoriesByParent(parentId);
      
      setCategories(prev => {
        const existingIds = new Set(prev.map(c => String(c.id)));
        const newChildren = children.filter(c => !existingIds.has(String(c.id)));
        return [...prev, ...newChildren];
      });
    } catch (error: any) {
      console.error('Error loading children:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadCategories();
    }
  }, [currentUser, loadCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const handleCreate = async () => {
    setEditingCategory(null);
    
    const roots = getRootCategories();
    if (roots.length === 0) {
      try {
        const rootCats = await categoryService.getRootCategories();
        setCategories(prev => {
          const existingIds = new Set(prev.map(c => String(c.id)));
          const newRoots = rootCats.filter(c => !existingIds.has(String(c.id)));
          return [...prev, ...newRoots];
        });
      } catch (error) {
        console.error('Error loading root categories:', error);
      }
    }
    
    setFormData({
      name: '',
      description: '',
      parentId: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      isActive: category.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Category name is required',
      });
      return;
    }

    setShowModal(false);
    
    try {
      // Remove parentId if empty
      const dataToSend = {
        ...formData,
        parentId: formData.parentId?.trim() || undefined,
      };

      if (editingCategory) {
        // Update
        await categoryService.updateCategory(editingCategory.id, dataToSend);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Category updated successfully',
        });
      } else {

        await categoryService.createCategory(dataToSend);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Category created successfully',
        });
      }
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to save category',
      });
    }
  };

  const handleDelete = (category: Category) => {
    setEditingCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!editingCategory) return;
    
    setShowDeleteModal(false);
    
    try {
      await categoryService.deleteCategory(editingCategory.id);
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Category deleted successfully',
      });
      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to delete category',
      });
    } finally {
      setEditingCategory(null);
    }
  };


  const toggleActive = async (category: Category) => {
    try {
      await categoryService.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Category ${!category.isActive ? 'activated' : 'deactivated'}`,
      });
      loadCategories();
    } catch (error: any) {
      console.error('Error toggling category:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status',
      });
    }
  };

  const getParentName = (parentId?: string | null) => {
    if (!parentId) return 'Root';
    const parent = categories.find(c => String(c.id) === String(parentId));
    return parent?.name || 'Unknown';
  };

  const getRootCategories = () => {
    return categories.filter(c => !c.parentId || c.parentId === null);
  };

  const getChildCategories = (parentId: string | number) => {
    return categories.filter(c => String(c.parentId) === String(parentId));
  };


  const toggleExpand = async (categoryId: string | number) => {
    const id = String(categoryId);
    const newExpanded = new Set(expandedCategories);
    
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      await loadChildrenIfNeeded(categoryId);
      newExpanded.add(id);
    }
    
    setExpandedCategories(newExpanded);
  };

  const renderCategoryItem = (item: Category, level: number = 0) => {
    const hasChildren = getChildCategories(item.id).length > 0;
    const isExpanded = expandedCategories.has(String(item.id));
    const children = isExpanded ? getChildCategories(item.id) : [];

    return (
      <View key={String(item.id)}>
        <View style={[styles.categoryCard, { marginLeft: level * 20 }]}>
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <TouchableOpacity 
              style={styles.expandButton}
              onPress={() => toggleExpand(item.id)}
            >
              <Ionicons 
                name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.expandButton} />
          )}

          <View style={styles.categoryIcon}>
            <Ionicons 
              name={item.icon ? item.icon as any : 'folder-outline'} 
              size={28} 
              color="#007AFF" 
            />
          </View>
          
          <View style={styles.categoryInfo}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Switch
                value={item.isActive ?? true}
                onValueChange={() => toggleActive(item)}
                trackColor={{ false: '#CCC', true: '#34C759' }}
              />
            </View>
            
            {item.description && (
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.categoryDetails}>
              {level === 0 && (
                <View style={styles.categoryBadge}>
                  <Ionicons name="layers-outline" size={12} color="#666" />
                  <Text style={styles.categoryBadgeText}>Root</Text>
                </View>
              )}
              {hasChildren && (
                <View style={[styles.categoryBadge, { backgroundColor: '#FF9500' }]}>
                  <Ionicons name="git-branch-outline" size={12} color="#FFF" />
                  <Text style={[styles.categoryBadgeText, { color: '#FFF' }]}>
                    {getChildCategories(item.id).length} children
                  </Text>
                </View>
              )}
              {item.productCount !== undefined && (
                <View style={[styles.categoryBadge, { backgroundColor: '#007AFF' }]}>
                  <Ionicons name="cube-outline" size={12} color="#FFF" />
                  <Text style={[styles.categoryBadgeText, { color: '#FFF' }]}>
                    {item.productCount} products
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.categoryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="create-outline" size={22} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { marginTop: 8 }]}
              onPress={() => handleDelete(item)}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Render children */}
        {children.map(child => renderCategoryItem(child, level + 1))}
      </View>
    );
  };

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Category Management</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Category List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No categories yet</Text>
          <TouchableOpacity onPress={handleCreate} style={styles.emptyButton}>
            <Text style={styles.emptyButtonText}>Create your first category</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {getRootCategories().map(category => renderCategoryItem(category, 0))}
        </ScrollView>
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g. Engine Oil"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Brief description of the category"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Parent Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Parent Category (Optional)</Text>
                <View style={styles.parentSelector}>
                  <TouchableOpacity
                    style={[styles.formInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                    onPress={() => setFormData({ ...formData, parentId: '' })}
                  >
                    <Text style={{ color: !formData.parentId ? '#333' : '#999' }}>
                      {formData.parentId ? getParentName(formData.parentId) : 'Root Category'}
                    </Text>
                    {formData.parentId && (
                      <Ionicons name="close-circle" size={20} color="#999" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.formHint}>
                  Select a parent category to create a subcategory
                </Text>
                
                {/* Parent options */}
                <View style={styles.optionsRow}>
                  {getRootCategories()
                    .filter(c => !editingCategory || String(c.id) !== String(editingCategory.id))
                    .map((cat) => (
                      <TouchableOpacity
                        key={String(cat.id)}
                        style={[
                          styles.optionButton,
                          formData.parentId === String(cat.id) && styles.optionButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, parentId: String(cat.id) })}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            formData.parentId === String(cat.id) && styles.optionTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </View>
              </View>

              {/* Active Status */}
              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.formLabel}>Active</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                    trackColor={{ false: '#CCC', true: '#34C759' }}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModal}>
            <Ionicons name="warning-outline" size={48} color="#FF3B30" />
            <Text style={styles.deleteTitle}>Confirm Delete</Text>
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete category "{editingCategory?.name}"?
            </Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

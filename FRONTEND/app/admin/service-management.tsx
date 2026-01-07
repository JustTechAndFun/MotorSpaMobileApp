import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { categoryService, motorServiceService } from '@/services';
import { styles } from '@/styles/admin-service-management-styles';
import {
  Category,
  CreateMotorServiceRequest,
  MotorService,
  ServiceType,
  VehicleType
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
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';

const VEHICLE_TYPES: VehicleType[] = ['SCOOTER', 'SPORT', 'CRUISER', 'TOURING', 'ELECTRIC'];
const SERVICE_TYPES: ServiceType[] = ['MAINTENANCE', 'REPAIR', 'INSPECTION', 'CLEANING', 'UPGRADE'];

export default function AdminServiceManagementScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const toast = useToast();
  
  const [services, setServices] = useState<MotorService[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingService, setEditingService] = useState<MotorService | null>(null);
  const [formData, setFormData] = useState<CreateMotorServiceRequest>({
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    vehicleType: 'SCOOTER',
    serviceType: 'MAINTENANCE',
    categoryId: '',
    discountPercentage: 0,
    imageUrl: '',
    isActive: true,
    estimatedDuration: 60,
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

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await motorServiceService.getServices();
      setServices(data);
    } catch (error: any) {
      console.error('Error loading services:', error);
      const message = error?.response?.data?.message || 'Failed to load services';
      
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

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadServices();
      loadCategories();
    }
  }, [currentUser, loadServices]);

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      vehicleType: 'SCOOTER',
      serviceType: 'MAINTENANCE',
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      discountPercentage: 0,
      imageUrl: '',
      isActive: true,
      estimatedDuration: 60,
    });
    setShowModal(true);
  };

  const handleEdit = (service: MotorService) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      shortDescription: service.shortDescription || '',
      price: service.price,
      vehicleType: service.vehicleType,
      serviceType: service.serviceType,
      categoryId: service.categoryId,
      discountPercentage: service.discountPercentage,
      imageUrl: service.imageUrl,
      isActive: service.isActive,
      estimatedDuration: service.estimatedDuration,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name || !formData.description || !formData.categoryId) {
      toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    if (formData.price <= 0) {
      toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Price must be greater than 0',
      });
      return;
    }

    setShowModal(false);
    
    try {
      if (editingService) {

        await motorServiceService.updateService(editingService.id!, formData);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Service updated successfully',
        });
      } else {
        await motorServiceService.createService(formData);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Service created successfully',
        });
      }
      loadServices();
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to save service',
      });
    }
  };

  const handleDelete = (service: MotorService) => {
    setEditingService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!editingService) return;
    
    setShowDeleteModal(false);
    
    try {
      await motorServiceService.deleteService(editingService.id!);
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Service deleted successfully',
      });
      loadServices();
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Failed to delete service',
      });
    } finally {
      setEditingService(null);
    }
  };


  const toggleActive = async (service: MotorService) => {
    try {
      await motorServiceService.updateService(service.id!, {
        isActive: !service.isActive,
      });
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Service ${!service.isActive ? 'activated' : 'deactivated'}`,
      });
      loadServices();
    } catch (error: any) {
      console.error('Error toggling service:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update status',
      });
    }
  };


  const renderServiceItem = ({ item }: { item: MotorService }) => (
    <View style={styles.serviceCard}>
      <Image 
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }} 
        style={styles.serviceImage}
      />
      
      <View style={styles.serviceInfo}>
        <View style={styles.serviceHeader}>
          <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleActive(item)}
            trackColor={{ false: '#CCC', true: '#34C759' }}
          />
        </View>
        
        <Text style={styles.serviceShortDesc} numberOfLines={2}>
          {item.shortDescription || item.description}
        </Text>
        
        <View style={styles.serviceDetails}>
          <View style={styles.serviceBadge}>
            <Text style={styles.serviceBadgeText}>{item.vehicleType}</Text>
          </View>
          <View style={[styles.serviceBadge, { backgroundColor: '#007AFF' }]}>
            <Text style={styles.serviceBadgeText}>{item.serviceType}</Text>
          </View>
        </View>
        
        <View style={styles.serviceFooter}>
          <Text style={styles.servicePrice}>
            {formatCurrency(item.price)} VNĐ
            {item.discountPercentage > 0 && (
              <Text style={styles.serviceDiscount}> (-{item.discountPercentage}%)</Text>
            )}
          </Text>
          <Text style={styles.serviceDuration}>⏱ {item.estimatedDuration}p</Text>
        </View>
      </View>
      
      <View style={styles.serviceActions}>
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
  );

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
        <Text style={styles.headerTitle}>Service Management</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Service List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No services yet</Text>
              <TouchableOpacity onPress={handleCreate} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Create your first service</Text>
              </TouchableOpacity>
            </View>
          }
        />
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
                {editingService ? 'Edit Service' : 'Create New Service'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Name *</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g. Regular Maintenance"
                />
              </View>

              {/* Short Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Short Description</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.shortDescription}
                  onChangeText={(text) => setFormData({ ...formData, shortDescription: text })}
                  placeholder="Brief description"
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Detailed Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Full service description"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Price */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price (VND) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(formData.price)}
                  onChangeText={(text) => setFormData({ ...formData, price: Number(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              {/* Vehicle Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Vehicle Type *</Text>
                <View style={styles.optionsRow}>
                  {VEHICLE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        formData.vehicleType === type && styles.optionButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, vehicleType: type })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          formData.vehicleType === type && styles.optionTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Service Type */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Service Type *</Text>
                <View style={styles.optionsRow}>
                  {SERVICE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        formData.serviceType === type && styles.optionButtonActive,
                      ]}
                      onPress={() => setFormData({ ...formData, serviceType: type })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          formData.serviceType === type && styles.optionTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category *</Text>
                {categories.length === 0 ? (
                  <View style={[styles.formInput, { justifyContent: 'center' }]}>
                    <Text style={{ color: '#999', fontSize: 12 }}>Loading categories...</Text>
                  </View>
                ) : (
                  <View style={styles.optionsRow}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.optionButton,
                          formData.categoryId === cat.id && styles.optionButtonActive,
                        ]}
                        onPress={() => setFormData({ ...formData, categoryId: String(cat.id) })}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            formData.categoryId === cat.id && styles.optionTextActive,
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Discount */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Discount (%)</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(formData.discountPercentage)}
                  onChangeText={(text) => setFormData({ ...formData, discountPercentage: Number(text) || 0 })}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>

              {/* Image URL */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Image URL</Text>
                <TextInput
                  style={styles.formInput}
                  value={formData.imageUrl}
                  onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                  placeholder="https://example.com/image.jpg"
                />
              </View>

              {/* Duration */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duration (minutes) *</Text>
                <TextInput
                  style={styles.formInput}
                  value={String(formData.estimatedDuration)}
                  onChangeText={(text) => setFormData({ ...formData, estimatedDuration: Number(text) || 0 })}
                  placeholder="60"
                  keyboardType="numeric"
                />
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
              Are you sure you want to delete service "{editingService?.name}"?
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

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

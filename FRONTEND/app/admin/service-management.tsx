import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { categoryService, motorServiceService } from '@/services';
import {
  Category,
  CreateMotorServiceRequest,
  MotorService,
  ServiceType,
  VehicleType
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
import { Text, View, Card, Colors } from 'react-native-ui-lib';

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
        {/* Service Image */}
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
          style={{
            width: 90,
            height: 90,
            borderRadius: 14,
            backgroundColor: Colors.grey80
          }}
        />

        {/* Service Info */}
        <View style={{ flex: 1, marginLeft: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text text70 style={{ fontWeight: 'bold', color: Colors.textColor, flex: 1, marginRight: 8 }} numberOfLines={1}>{item.name}</Text>
            <Switch
              value={item.isActive}
              onValueChange={() => toggleActive(item)}
              trackColor={{ false: Colors.grey60, true: Colors.primaryColor }}
              thumbColor="white"
            />
          </View>

          <Text text90 style={{ color: Colors.grey50, marginBottom: 8 }} numberOfLines={2}>
            {item.shortDescription || item.description}
          </Text>

          {/* Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: Colors.primaryColor,
                opacity: 0.15,
                borderWidth: 1,
                borderColor: Colors.primaryColor
              }}
            >
              <Text text90 style={{ color: Colors.primaryColor, fontWeight: 'bold' }}>{item.vehicleType}</Text>
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: Colors.blue30,
                opacity: 0.15,
                borderWidth: 1,
                borderColor: Colors.blue30
              }}
            >
              <Text text90 style={{ color: Colors.blue30, fontWeight: 'bold' }}>{item.serviceType}</Text>
            </View>
          </View>

          {/* Price and Duration */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text text70 style={{ fontWeight: 'bold', color: Colors.primaryColor }}>
                {formatCurrency(item.price)} VNĐ
              </Text>
              {item.discountPercentage > 0 && (
                <Text text90 style={{ color: Colors.red30, fontWeight: '600' }}> -{item.discountPercentage}%</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MaterialIcons name="schedule" size={14} color={Colors.grey50} />
              <Text text90 style={{ color: Colors.grey50 }}>{item.estimatedDuration}p</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 }}>
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: Colors.blue30,
            gap: 6
          }}
        >
          <MaterialIcons name="edit" size={18} color="white" />
          <Text text80 white style={{ fontWeight: 'bold' }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: Colors.red30,
            gap: 6
          }}
        >
          <MaterialIcons name="delete" size={18} color="white" />
          <Text text80 white style={{ fontWeight: 'bold' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.grey80 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View style={{ paddingTop: 5, paddingBottom: 14, paddingHorizontal: 5, backgroundColor: 'white' }}>
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
          <Text text50 style={{ fontWeight: 'bold', color: Colors.textColor }}>Service Management</Text>
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

      {/* Service List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 marginT-10 style={{ color: Colors.grey50 }}>Loading services...</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={{
            paddingTop: 16,
            paddingHorizontal: 5,
            paddingBottom: 100
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryColor]} />
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
                <MaterialIcons name="room-service" size={50} color={Colors.grey60} />
              </View>
              <Text text60 textColor style={{ fontWeight: 'bold', marginBottom: 8 }}>No services found</Text>
              <Text text80 grey50 style={{ marginBottom: 24 }}>Create your first service</Text>
              <TouchableOpacity
                onPress={handleCreate}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  borderRadius: 14,
                  backgroundColor: Colors.primaryColor,
                  shadowColor: Colors.primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 4
                }}
              >
                <Text text70 white style={{ fontWeight: 'bold' }}>Create Service</Text>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: '90%'
            }}
          >
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
                {editingService ? 'Edit Service' : 'Create New Service'}
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
              {/* Name */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Service Name *</Text>
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
                  placeholder="e.g. Regular Maintenance"
                  placeholderTextColor={Colors.grey50}
                />
              </View>

              {/* Short Description */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Short Description</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={formData.shortDescription}
                  onChangeText={(text) => setFormData({ ...formData, shortDescription: text })}
                  placeholder="Brief description"
                  placeholderTextColor={Colors.grey50}
                />
              </View>

              {/* Description */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Detailed Description *</Text>
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
                  placeholder="Full service description"
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

              {/* Vehicle Type */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Vehicle Type *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {VEHICLE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFormData({ ...formData, vehicleType: type })}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: formData.vehicleType === type ? Colors.primaryColor : Colors.grey80
                      }}
                    >
                      <Text
                        text80
                        style={{
                          color: formData.vehicleType === type ? 'white' : Colors.textColor,
                          fontWeight: '600'
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Service Type */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Service Type *</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {SERVICE_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFormData({ ...formData, serviceType: type })}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 12,
                        backgroundColor: formData.serviceType === type ? Colors.primaryColor : Colors.grey80
                      }}
                    >
                      <Text
                        text80
                        style={{
                          color: formData.serviceType === type ? 'white' : Colors.textColor,
                          fontWeight: '600'
                        }}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Selection */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Category *</Text>
                {categories.length === 0 ? (
                  <View style={{ padding: 14, backgroundColor: Colors.grey80, borderRadius: 14, justifyContent: 'center' }}>
                    <Text text80 style={{ color: Colors.grey50 }}>Loading categories...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setFormData({ ...formData, categoryId: String(cat.id) })}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 10,
                          borderRadius: 12,
                          backgroundColor: formData.categoryId === cat.id ? Colors.primaryColor : Colors.grey80
                        }}
                      >
                        <Text
                          text80
                          style={{
                            color: formData.categoryId === cat.id ? 'white' : Colors.textColor,
                            fontWeight: '600'
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Discount */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Discount (%)</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={String(formData.discountPercentage)}
                  onChangeText={(text) => setFormData({ ...formData, discountPercentage: Number(text) || 0 })}
                  placeholder="0"
                  placeholderTextColor={Colors.grey50}
                  keyboardType="numeric"
                />
              </View>

              {/* Image URL */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Image URL</Text>
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
              </View>

              {/* Duration */}
              <View style={{ marginBottom: 16 }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor, marginBottom: 8 }}>Duration (minutes) *</Text>
                <TextInput
                  style={{
                    backgroundColor: Colors.grey80,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 14,
                    fontSize: 15,
                    color: Colors.textColor
                  }}
                  value={String(formData.estimatedDuration)}
                  onChangeText={(text) => setFormData({ ...formData, estimatedDuration: Number(text) || 0 })}
                  placeholder="60"
                  placeholderTextColor={Colors.grey50}
                  keyboardType="numeric"
                />
              </View>

              {/* Active Status */}
              <View style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text text80 style={{ fontWeight: '600', color: Colors.textColor }}>Active</Text>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
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
                  onPress={handleSave}
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
                  <Text text70 white style={{ fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
            <Text text60 style={{ fontWeight: 'bold', color: Colors.textColor, marginBottom: 8, textAlign: 'center' }}>Delete Service</Text>
            <Text text80 style={{ color: Colors.grey50, marginBottom: 24, textAlign: 'center' }}>
              Are you sure you want to delete service "{editingService?.name}"? This action cannot be undone.
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
  );
}

function formatCurrency(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

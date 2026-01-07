import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView, TextInput, TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { locationService } from '../../services';
import { styles } from '../../styles/admin-location-management-styles';
import { StoreLocation } from '../../types/api.types';

export default function LocationManagementScreen() {
  const router = useRouter();
  
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StoreLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error: any) {
      console.error('Error loading locations:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách địa điểm');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLocations();
    setRefreshing(false);
  }, []);

  const handleAddNew = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      phone: '',
      description: '',
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (location: StoreLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      phone: location.phone,
      description: location.description || '',
      isActive: location.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = (location: StoreLocation) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa địa điểm "${location.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await locationService.deleteLocation(location.id);
              Alert.alert('Thành công', 'Đã xóa địa điểm');
              loadLocations();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa địa điểm');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên địa điểm');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ');
      return;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số điện thoại');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Lỗi', 'Tọa độ không hợp lệ');
      return;
    }

    try {
      const data = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        latitude: lat,
        longitude: lng,
        phone: formData.phone.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      };

      if (editingLocation) {
        await locationService.updateLocation(editingLocation.id, data);
        Alert.alert('Thành công', 'Đã cập nhật địa điểm');
      } else {
        await locationService.createLocation(data);
        Alert.alert('Thành công', 'Đã thêm địa điểm mới');
      }

      setModalVisible(false);
      loadLocations();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu địa điểm');
    }
  };

  const filteredLocations = locations.filter((loc) => {
    const query = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(query) ||
      loc.address.toLowerCase().includes(query) ||
      loc.phone.includes(query)
    );
  });

  const activeCount = locations.filter((l) => l.isActive).length;
  const inactiveCount = locations.filter((l) => !l.isActive).length;

  const renderLocationItem = ({ item }: { item: StoreLocation }) => (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.locationTitleRow}>
            <Text style={styles.locationName}>{item.name}</Text>
            <View style={[styles.statusBadge, item.isActive ? styles.statusActive : styles.statusInactive]}>
              <Text style={styles.statusText}>
                {item.isActive ? 'Hoạt động' : 'Tạm đóng'}
              </Text>
            </View>
          </View>
          
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.locationAddress} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
          
          <View style={styles.locationInfo}>
            <Ionicons name="call" size={14} color="#666" />
            <Text style={styles.locationPhone}>{item.phone}</Text>
          </View>

          {item.description && (
            <Text style={styles.locationDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.locationCoords}>
            <Text style={styles.coordText}>
              📍 {item.latitude}, {item.longitude}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.locationActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color="#007AFF" />
          <Text style={styles.actionButtonText}>Sửa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.deleteText]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quản lý địa điểm</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
          <Text style={{ marginTop: 12, color: '#666' }}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý địa điểm</Text>
        <TouchableOpacity onPress={handleAddNew} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#82b440" />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{locations.length}</Text>
          <Text style={styles.statLabel}>Tổng số</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#34C759' }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#FF9500' }]}>{inactiveCount}</Text>
          <Text style={styles.statLabel}>Tạm đóng</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên, địa chỉ, SĐT..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Location List */}
      <FlatList
        data={filteredLocations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#82b440']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy địa điểm' : 'Chưa có địa điểm nào'}
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingLocation ? 'Sửa địa điểm' : 'Thêm địa điểm mới'}
            </Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.saveButton}>Lưu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên địa điểm *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Motor Spa - Quận 1"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Địa chỉ *</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Số nhà, đường, quận, thành phố"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Vĩ độ (Latitude) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10.7769"
                  value={formData.latitude}
                  onChangeText={(text) => setFormData({ ...formData, latitude: text })}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Kinh độ (Longitude) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="106.7009"
                  value={formData.longitude}
                  onChangeText={(text) => setFormData({ ...formData, longitude: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="+84901234567"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                placeholder="Mô tả về địa điểm..."
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <TouchableOpacity
                style={styles.switchRow}
                onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Trạng thái hoạt động</Text>
                  <Text style={styles.helperText}>
                    Địa điểm {formData.isActive ? 'đang hoạt động' : 'tạm đóng'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.switch,
                    formData.isActive ? styles.switchActive : styles.switchInactive,
                  ]}
                >
                  <View
                    style={[
                      styles.switchThumb,
                      formData.isActive && styles.switchThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

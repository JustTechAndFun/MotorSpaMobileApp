import { addressService } from '@/services';
import { Address } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../styles/setting-location-styles';

export default function SettingLocationPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState({ type: 'success' as 'success' | 'error', title: '', message: '' });

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [])
  );

  const showMessage = (type: 'success' | 'error', title: string, message: string) => {
    setModalMessage({ type, title, message });
    setMessageModalVisible(true);
  };

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (error: any) {
      console.error('Load addresses error:', error);
      
      if (error.message && !error.message.includes('Phiên đăng nhập hết hạn')) {
        showMessage('error', 'Error', error.message || 'Cannot load address list');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressService.setDefaultAddress(addressId);
      await loadAddresses();
      showMessage('success', 'Success', 'Default address updated successfully');
    } catch (error: any) {
      console.error('Set default error:', error);
      if (error.message && !error.message.includes('Phiên đăng nhập hết hạn')) {
        showMessage('error', 'Error', error.message || 'Cannot update default address');
      }
    }
  };

  const handleDeleteAddress = (address: Address) => {
    setDeletingAddress(address);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingAddress) return;
    
    try {
      await addressService.deleteAddress(deletingAddress.id);
      setDeleteModalVisible(false);
      setDeletingAddress(null);
      await loadAddresses();
      showMessage('success', 'Success', 'Address deleted successfully');
    } catch (error: any) {
      console.error('Delete address error:', error);
      setDeleteModalVisible(false);
      setDeletingAddress(null);
      if (error.message && !error.message.includes('Phiên đăng nhập hết hạn')) {
        showMessage('error', 'Error', error.message || 'Cannot delete address');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipment Location</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A7C59" />
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadAddresses();
              }}
            />
          }
        >
          {/* Address List */}
          <View style={styles.addressList}>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No addresses yet</Text>
                <Text style={styles.emptySubtext}>Add your first shipping address</Text>
              </View>
            ) : (
              addresses.map((address) => (
                <View key={address.id} style={[
                  styles.addressCard,
                  address.isDefault && styles.addressCardPrimary
                ]}>
                  <View style={styles.addressHeader}>
                    <View style={styles.nameContainer}>
                      <TouchableOpacity 
                        style={styles.checkboxContainer}
                        onPress={() => handleSetDefault(String(address.id))}
                      >
                        <Ionicons 
                          name={address.isDefault ? "checkmark-circle" : "ellipse-outline"} 
                          size={24} 
                          color={address.isDefault ? "#4A7C59" : "#ccc"} 
                        />
                      </TouchableOpacity>
                      <Text style={styles.addressName}>{address.name}</Text>
                    </View>
                    {address.isDefault && (
                      <Text style={styles.primaryBadge}>DEFAULT</Text>
                    )}
                  </View>

                  <View style={styles.addressBodyContainer}>
                    <View style={styles.addressBody}>
                      <Text style={styles.addressText}>{address.address}</Text>
                      <Text style={styles.phoneText}>{address.phone}</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteAddress(address)}
                    >
                      <Ionicons name="trash-outline" size={24} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Add Address Button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/add-location')}
          >
            <Text style={styles.addButtonText}>Add Location</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalIcon}>
              <Ionicons name="warning" size={48} color="#ff4444" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Address</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{deletingAddress?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletingAddress(null);
                }}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteModalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal (Success/Error) */}
      <Modal
        visible={messageModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.messageModalOverlay}>
          <View style={styles.messageModalContent}>
            <View style={styles.messageModalIcon}>
              <Ionicons 
                name={modalMessage.type === 'success' ? 'checkmark-circle' : 'close-circle'} 
                size={64} 
                color={modalMessage.type === 'success' ? '#82b440' : '#ff4444'} 
              />
            </View>
            <Text style={styles.messageModalTitle}>{modalMessage.title}</Text>
            <Text style={styles.messageModalMessage}>{modalMessage.message}</Text>
            <TouchableOpacity
              style={[
                styles.messageModalButton,
                modalMessage.type === 'success' ? styles.messageModalButtonSuccess : styles.messageModalButtonError
              ]}
              onPress={() => setMessageModalVisible(false)}
            >
              <Text style={styles.messageModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

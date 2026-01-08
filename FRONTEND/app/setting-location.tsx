import { addressService } from '@/services';
import { Address } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Colors, Card, Button } from 'react-native-ui-lib';
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
    <View flex bg-grey80>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View
        row
        centerV
        paddingH-20
        paddingT-15
        paddingB-18
        bg-white
        style={{
          borderBottomWidth: 1.5,
          borderBottomColor: Colors.grey70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 3
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Colors.grey80,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text text40 textColor style={{ fontWeight: 'bold' }}>Shipment Location</Text>
      </View>

      {/* Content */}
      {isLoading ? (
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>Loading addresses...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadAddresses();
              }}
              colors={[Colors.primaryColor]}
            />
          }
        >
          {/* Address List */}
          {addresses.length === 0 ? (
            <View center marginT-80>
              <View
                width={120}
                height={120}
                center
                br100
                bg-grey80
                marginB-25
              >
                <Ionicons name="location-outline" size={60} color={Colors.grey40} />
              </View>
              <Text text50 textColor style={{ fontWeight: 'bold' }}>No addresses yet</Text>
              <Text text80 grey40 marginT-12>Add your first shipping address</Text>
            </View>
          ) : (
            <View paddingH-20>
              {addresses.map((address) => (
                <Card
                  key={address.id}
                  padding-18
                  marginB-16
                  style={{
                    borderRadius: 18,
                    borderWidth: address.isDefault ? 2.5 : 1.5,
                    borderColor: address.isDefault ? Colors.primaryColor : Colors.grey70,
                    backgroundColor: address.isDefault ? '#F0F4FF' : Colors.white,
                    shadowColor: address.isDefault ? Colors.primaryColor : '#000',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: address.isDefault ? 0.15 : 0.08,
                    shadowRadius: 8,
                    elevation: address.isDefault ? 5 : 3
                  }}
                >
                  <View row spread centerV marginB-15>
                    <View row centerV flex>
                      <TouchableOpacity
                        onPress={() => handleSetDefault(String(address.id))}
                        style={{ marginRight: 12 }}
                      >
                        <View
                          width={28}
                          height={28}
                          br100
                          center
                          style={{
                            backgroundColor: address.isDefault ? Colors.primaryColor : 'transparent',
                            borderWidth: address.isDefault ? 0 : 2.5,
                            borderColor: Colors.grey50
                          }}
                        >
                          {address.isDefault && <Ionicons name="checkmark" size={18} color="white" />}
                        </View>
                      </TouchableOpacity>
                      <Text text60 textColor style={{ fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
                        {address.name}
                      </Text>
                    </View>
                    {address.isDefault && (
                      <View
                        paddingH-12
                        paddingV-6
                        style={{
                          backgroundColor: Colors.primaryColor,
                          borderRadius: 12
                        }}
                      >
                        <Text text90 white style={{ fontWeight: 'bold' }}>DEFAULT</Text>
                      </View>
                    )}
                  </View>

                  <View row>
                    <View flex marginR-12>
                      <Text text80 grey30 marginB-8 style={{ lineHeight: 22 }}>
                        {address.address}
                      </Text>
                      <View row centerV>
                        <Ionicons name="call-outline" size={16} color={Colors.grey40} />
                        <Text text80 grey40 marginL-8 style={{ fontWeight: '600' }}>
                          {address.phone}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteAddress(address)}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: '#FEE2E2',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Ionicons name="trash-outline" size={24} color={Colors.red30} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Add Address Button */}
          <View paddingH-20 marginT-10>
            <TouchableOpacity
              onPress={() => router.push('/add-location')}
              activeOpacity={0.7}
              style={{
                paddingVertical: 18,
                borderRadius: 18,
                borderWidth: 2,
                borderColor: Colors.primaryColor,
                borderStyle: 'dashed',
                backgroundColor: Colors.white,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row'
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.primaryColor} style={{ marginRight: 10 }} />
              <Text text70 primaryColor style={{ fontWeight: 'bold' }}>Add Location</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View flex center style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View
            width="88%"
            padding-28
            bg-white
            style={{
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10
            }}
          >
            <View
              width={70}
              height={70}
              center
              br100
              marginB-20
              style={{
                backgroundColor: '#FEE2E2',
                alignSelf: 'center'
              }}
            >
              <Ionicons name="warning" size={36} color={Colors.red30} />
            </View>
            <Text text40 textColor center style={{ fontWeight: 'bold' }}>Delete Address</Text>
            <Text text70 grey40 center marginV-20 style={{ lineHeight: 24 }}>
              Are you sure you want to delete "{deletingAddress?.name}"? This action cannot be undone.
            </Text>
            <View row spread marginT-10>
              <Button
                flex
                marginR-10
                label="Cancel"
                outline
                outlineColor={Colors.grey50}
                color={Colors.grey30}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletingAddress(null);
                }}
                style={{ height: 54, borderRadius: 16 }}
                labelStyle={{ fontWeight: '600', fontSize: 15 }}
              />
              <Button
                flex
                label="Delete"
                backgroundColor={Colors.red30}
                onPress={confirmDelete}
                style={{ height: 54, borderRadius: 16 }}
                labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
                enableShadow
              />
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
        <View flex center style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View
            width="88%"
            padding-28
            bg-white
            style={{
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 10
            }}
          >
            <View
              width={70}
              height={70}
              center
              br100
              marginB-20
              style={{
                backgroundColor: modalMessage.type === 'success' ? '#E8F5E9' : '#FEE2E2',
                alignSelf: 'center'
              }}
            >
              <Ionicons
                name={modalMessage.type === 'success' ? 'checkmark-circle' : 'close-circle'}
                size={36}
                color={modalMessage.type === 'success' ? '#4CAF50' : Colors.red30}
              />
            </View>
            <Text text40 textColor center style={{ fontWeight: 'bold' }}>{modalMessage.title}</Text>
            <Text text70 grey40 center marginV-20 style={{ lineHeight: 24 }}>
              {modalMessage.message}
            </Text>
            <Button
              label="OK"
              backgroundColor={modalMessage.type === 'success' ? '#4CAF50' : Colors.red30}
              onPress={() => setMessageModalVisible(false)}
              style={{ height: 54, borderRadius: 16 }}
              labelStyle={{ fontWeight: 'bold', fontSize: 15 }}
              enableShadow
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

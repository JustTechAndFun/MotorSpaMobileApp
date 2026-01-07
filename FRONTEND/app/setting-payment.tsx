import { useToast } from '@/components/toast';
import { paymentMethodService } from '@/services';
import type { CreatePaymentMethodRequest, PaymentMethod, PaymentMethodType } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../styles/setting-payment-styles';

export default function SettingPaymentPage() {
  const router = useRouter();
  const toast = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  
  const [formType, setFormType] = useState<PaymentMethodType>('CREDIT_CARD');
  const [formName, setFormName] = useState('');
  const [formLastFourDigits, setFormLastFourDigits] = useState('');
  const [formCardBrand, setFormCardBrand] = useState('');
  const [formBankName, setFormBankName] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formWalletProvider, setFormWalletProvider] = useState('');
  const [formWalletPhone, setFormWalletPhone] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentMethodService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error: any) {
      console.error('Error loading payment methods:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load payment methods',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPaymentMethods();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const openAddModal = () => {
    resetForm();
    setEditingMethod(null);
    setModalVisible(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormType(method.type);
    setFormName(method.name);
    setFormLastFourDigits(method.lastFourDigits || '');
    setFormCardBrand(method.cardBrand || '');
    setFormBankName(method.bankName || '');
    setFormAccountNumber(method.accountNumber || '');
    setFormWalletProvider(method.walletProvider || '');
    setFormWalletPhone(method.walletPhone || '');
    setFormIsDefault(method.isDefault);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormType('CREDIT_CARD');
    setFormName('');
    setFormLastFourDigits('');
    setFormCardBrand('');
    setFormBankName('');
    setFormAccountNumber('');
    setFormWalletProvider('');
    setFormWalletPhone('');
    setFormIsDefault(false);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter payment method name',
      });
      return;
    }

    setSaving(true);
    try {
      const data: CreatePaymentMethodRequest = {
        type: formType,
        name: formName.trim(),
        isDefault: formIsDefault,
      };

      if (formType === 'CREDIT_CARD' || formType === 'DEBIT_CARD') {
        if (formLastFourDigits) data.lastFourDigits = formLastFourDigits;
        if (formCardBrand) data.cardBrand = formCardBrand;
      } else if (formType === 'BANK_TRANSFER') {
        if (formBankName) data.bankName = formBankName;
        if (formAccountNumber) data.accountNumber = formAccountNumber;
      } else if (formType === 'E_WALLET') {
        if (formWalletProvider) data.walletProvider = formWalletProvider;
        if (formWalletPhone) data.walletPhone = formWalletPhone;
      }

      if (editingMethod) {
        await paymentMethodService.updatePaymentMethod(editingMethod.id, data);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Payment method updated successfully',
        });
      } else {
        await paymentMethodService.createPaymentMethod(data);
        toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Payment method added successfully',
        });
      }

      setModalVisible(false);
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to save payment method',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (method: PaymentMethod) => {
    console.log('handleDelete called for method:', method);
    setDeletingMethod(method);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingMethod) return;
    
    try {
      console.log('Deleting payment method:', deletingMethod.id);
      await paymentMethodService.deletePaymentMethod(deletingMethod.id);
      console.log('Delete successful');
      setDeleteModalVisible(false);
      setDeletingMethod(null);
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Payment method deleted successfully',
      });
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Failed to delete payment method',
      });
      setDeleteModalVisible(false);
      setDeletingMethod(null);
    }
  };

  const handleSetDefault = async (method: PaymentMethod) => {
    try {
      await paymentMethodService.updatePaymentMethod(method.id, { isDefault: true });
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Default payment method updated',
      });
      loadPaymentMethods();
    } catch (error: any) {
      console.error('Error setting default:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to set default payment method',
      });
    }
  };

  const getPaymentIcon = (method: PaymentMethod): string => {
    if (method.type === 'CREDIT_CARD' || method.type === 'DEBIT_CARD') {
      return 'card';
    } else if (method.type === 'BANK_TRANSFER') {
      return 'business';
    } else if (method.type === 'E_WALLET') {
      return 'wallet';
    } else if (method.type === 'COD') {
      return 'cash';
    }
    return 'card';
  };

  const getPaymentLabel = (method: PaymentMethod): string => {
    if (method.lastFourDigits) {
      return `•••• ${method.lastFourDigits}`;
    } else if (method.accountNumber) {
      return method.accountNumber;
    } else if (method.walletPhone) {
      return method.walletPhone;
    }
    return method.type.replace('_', ' ');
  };

  const renderTypeButton = (type: PaymentMethodType, label: string) => (
    <TouchableOpacity
      style={[styles.typeButton, formType === type && styles.typeButtonActive]}
      onPress={() => setFormType(type)}
    >
      <Text style={[styles.typeButtonText, formType === type && styles.typeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#82b440" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#82b440']} />
        }
      >
        {/* Payment Methods List */}
        <View style={styles.sectionContainer}>
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No payment methods added</Text>
              <Text style={styles.emptySubtext}>Add your first payment method to get started</Text>
            </View>
          ) : (
            <View style={styles.paymentList}>
              {paymentMethods.map((method) => (
                <View key={method.id} style={styles.paymentCard}>
                  <View style={styles.paymentContent}>
                    {/* Icon */}
                    <View style={styles.paymentIconContainer}>
                      <Ionicons name={getPaymentIcon(method) as any} size={28} color="#82b440" />
                    </View>

                    {/* Name and Details */}
                    <View style={styles.paymentInfo}>
                      <View style={styles.paymentNameRow}>
                        <Text style={styles.paymentName}>{method.name}</Text>
                        {method.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.paymentDetails}>{getPaymentLabel(method)}</Text>
                      {method.cardBrand && (
                        <Text style={styles.paymentBrand}>{method.cardBrand}</Text>
                      )}
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.paymentActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method)}
                      >
                        <Ionicons name="star-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => openEditModal(method)}
                    >
                      <Ionicons name="pencil" size={20} color="#666" />
                    </TouchableOpacity>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(method)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add-circle" size={24} color="#82b440" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Selection */}
              <Text style={styles.label}>Type</Text>
              <View style={styles.typeButtonRow}>
                {renderTypeButton('CREDIT_CARD', 'Credit Card')}
                {renderTypeButton('DEBIT_CARD', 'Debit Card')}
              </View>
              <View style={styles.typeButtonRow}>
                {renderTypeButton('BANK_TRANSFER', 'Bank Transfer')}
                {renderTypeButton('E_WALLET', 'E-Wallet')}
              </View>
              <View style={styles.typeButtonRow}>
                {renderTypeButton('COD', 'Cash on Delivery')}
              </View>

              {/* Name */}
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g., My Visa Card"
                placeholderTextColor="#999"
              />

              {/* Credit/Debit Card Fields */}
              {(formType === 'CREDIT_CARD' || formType === 'DEBIT_CARD') && (
                <>
                  <Text style={styles.label}>Bank Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formBankName}
                    onChangeText={setFormBankName}
                    placeholder="e.g., Vietcombank, Techcombank"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.label}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formAccountNumber}
                    onChangeText={setFormAccountNumber}
                    placeholder="1234567890"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />

                  <Text style={styles.label}>Last 4 Digits</Text>
                  <TextInput
                    style={styles.input}
                    value={formLastFourDigits}
                    onChangeText={setFormLastFourDigits}
                    placeholder="1234"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={4}
                  />

                  <Text style={styles.label}>Card Brand</Text>
                  <TextInput
                    style={styles.input}
                    value={formCardBrand}
                    onChangeText={setFormCardBrand}
                    placeholder="Visa, Mastercard, etc."
                    placeholderTextColor="#999"
                  />
                </>
              )}

              {/* Bank Transfer Fields */}
              {formType === 'BANK_TRANSFER' && (
                <>
                  <Text style={styles.label}>Bank Name</Text>
                  <TextInput
                    style={styles.input}
                    value={formBankName}
                    onChangeText={setFormBankName}
                    placeholder="e.g., Bank Central Asia"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.label}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formAccountNumber}
                    onChangeText={setFormAccountNumber}
                    placeholder="1234567890"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                  />
                </>
              )}

              {/* E-Wallet Fields */}
              {formType === 'E_WALLET' && (
                <>
                  <Text style={styles.label}>Wallet Provider</Text>
                  <TextInput
                    style={styles.input}
                    value={formWalletProvider}
                    onChangeText={setFormWalletProvider}
                    placeholder="e.g., OVO, GoPay, Dana"
                    placeholderTextColor="#999"
                  />

                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={formWalletPhone}
                    onChangeText={setFormWalletPhone}
                    placeholder="08123456789"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </>
              )}

              {/* Set as Default */}
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setFormIsDefault(!formIsDefault)}
              >
                <Ionicons
                  name={formIsDefault ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={formIsDefault ? '#82b440' : '#999'}
                />
                <Text style={styles.checkboxLabel}>Set as default payment method</Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingMethod ? 'Update' : 'Add'} Payment Method
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.deleteModalTitle}>Delete Payment Method</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{deletingMethod?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletingMethod(null);
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
    </SafeAreaView>
  );
}

import { useToast } from '@/components/toast';
import { paymentMethodService } from '@/services';
import type { CreatePaymentMethodRequest, PaymentMethod, PaymentMethodType } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text, View, Colors, Card } from 'react-native-ui-lib';

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

  // Common input style
  const inputStyle = {
    backgroundColor: Colors.grey80,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textColor,
    marginBottom: 20
  };

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
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: formType === type ? Colors.primaryColor : Colors.grey80,
        borderWidth: formType === type ? 2 : 0,
        borderColor: formType === type ? Colors.primaryColor : 'transparent'
      }}
      onPress={() => setFormType(type)}
    >
      <Text
        text80
        center
        style={{
          color: formType === type ? 'white' : Colors.textColor,
          fontWeight: formType === type ? 'bold' : '600'
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View flex bg-grey80>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" />
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>Loading payment methods...</Text>
        </View>
      </View>
    );
  }

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
          onPress={handleBack}
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
        <Text text40 textColor style={{ fontWeight: 'bold' }}>Payment Methods</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primaryColor]} />
        }
      >
        {/* Payment Methods List */}
        {paymentMethods.length === 0 ? (
          <View flex center paddingH-40 marginT-60>
            <View
              width={120}
              height={120}
              center
              br100
              bg-white
              marginB-25
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Ionicons name="card-outline" size={60} color={Colors.grey40} />
            </View>
            <Text text50 textColor center style={{ fontWeight: 'bold' }}>No payment methods</Text>
            <Text text80 grey40 center marginT-12 style={{ lineHeight: 24 }}>
              Add your first payment method to get started
            </Text>
          </View>
        ) : (
          <View>
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                padding-18
                marginB-16
                enableShadow
                style={{ borderRadius: 18 }}
              >
                <View row centerV marginB-14>
                  {/* Icon */}
                  <View
                    width={50}
                    height={50}
                    center
                    br100
                    marginR-15
                    style={{ backgroundColor: Colors.primaryColor + '20' }}
                  >
                    <Ionicons
                      name={getPaymentIcon(method) as any}
                      size={28}
                      color={Colors.primaryColor}
                    />
                  </View>

                  {/* Name and Details */}
                  <View flex>
                    <View row centerV>
                      <Text text70 textColor style={{ fontWeight: 'bold' }}>
                        {method.name}
                      </Text>
                      {method.isDefault && (
                        <View
                          paddingH-10
                          paddingV-4
                          marginL-10
                          style={{
                            backgroundColor: Colors.primaryColor + '20',
                            borderRadius: 10
                          }}
                        >
                          <Text text90 style={{ color: Colors.primaryColor, fontWeight: 'bold' }}>
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text text80 grey40 marginT-4>
                      {getPaymentLabel(method)}
                    </Text>
                    {method.cardBrand && (
                      <Text text90 grey40 marginT-2>
                        {method.cardBrand}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Actions */}
                <View
                  row
                  centerV
                  paddingT-14
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: Colors.grey80
                  }}
                >
                  {!method.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleSetDefault(method)}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        marginRight: 8
                      }}
                    >
                      <Ionicons name="star-outline" size={18} color={Colors.grey40} />
                      <Text text80 grey40 marginL-6 style={{ fontWeight: '600' }}>
                        Set Default
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => openEditModal(method)}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 10,
                      marginHorizontal: 8
                    }}
                  >
                    <Ionicons name="pencil" size={18} color={Colors.grey40} />
                    <Text text80 grey40 marginL-6 style={{ fontWeight: '600' }}>
                      Edit
                    </Text>
                  </TouchableOpacity>
                  {!method.isDefault && (
                    <TouchableOpacity
                      onPress={() => handleDelete(method)}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 10,
                        marginLeft: 8
                      }}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                      <Text text80 style={{ color: '#ff4444', marginLeft: 6, fontWeight: '600' }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Add Button */}
        <TouchableOpacity
          onPress={openAddModal}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            marginTop: 16,
            backgroundColor: 'white',
            borderRadius: 18,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: Colors.primaryColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2
          }}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primaryColor} />
          <Text text70 primaryColor marginL-12 style={{ fontWeight: 'bold' }}>
            Add Payment Method
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
            paddingBottom: 30
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 24,
              paddingBottom: 20,
              borderBottomWidth: 1.5,
              borderBottomColor: Colors.grey80
            }}>
              <Text text50 textColor style={{ fontWeight: 'bold' }}>
                {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: Colors.grey80,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="close" size={22} color={Colors.textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}
            >
              {/* Type Selection */}
              <Text text70 textColor marginB-12 style={{ fontWeight: 'bold' }}>Type</Text>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {renderTypeButton('CREDIT_CARD', 'Credit Card')}
                {renderTypeButton('DEBIT_CARD', 'Debit Card')}
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {renderTypeButton('BANK_TRANSFER', 'Bank Transfer')}
                {renderTypeButton('E_WALLET', 'E-Wallet')}
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                {renderTypeButton('COD', 'Cash on Delivery')}
              </View>

              {/* Name */}
              <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Name *</Text>
              <TextInput
                style={{
                  backgroundColor: Colors.grey80,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: Colors.textColor,
                  marginBottom: 20
                }}
                value={formName}
                onChangeText={setFormName}
                placeholder="e.g., My Visa Card"
                placeholderTextColor={Colors.grey40}
              />

              {/* Credit/Debit Card Fields */}
              {(formType === 'CREDIT_CARD' || formType === 'DEBIT_CARD') && (
                <>
                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Bank Name</Text>
                  <TextInput
                    style={inputStyle}
                    value={formBankName}
                    onChangeText={setFormBankName}
                    placeholder="e.g., Vietcombank, Techcombank"
                    placeholderTextColor={Colors.grey40}
                  />

                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Account Number</Text>
                  <TextInput
                    style={inputStyle}
                    value={formAccountNumber}
                    onChangeText={setFormAccountNumber}
                    placeholder="1234567890"
                    placeholderTextColor={Colors.grey40}
                    keyboardType="numeric"
                  />

                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Last 4 Digits</Text>
                  <TextInput
                    style={inputStyle}
                    value={formLastFourDigits}
                    onChangeText={setFormLastFourDigits}
                    placeholder="1234"
                    placeholderTextColor={Colors.grey40}
                    keyboardType="numeric"
                    maxLength={4}
                  />

                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Card Brand</Text>
                  <TextInput
                    style={inputStyle}
                    value={formCardBrand}
                    onChangeText={setFormCardBrand}
                    placeholder="Visa, Mastercard, etc."
                    placeholderTextColor={Colors.grey40}
                  />
                </>
              )}

              {/* Bank Transfer Fields */}
              {formType === 'BANK_TRANSFER' && (
                <>
                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Bank Name</Text>
                  <TextInput
                    style={inputStyle}
                    value={formBankName}
                    onChangeText={setFormBankName}
                    placeholder="e.g., Bank Central Asia"
                    placeholderTextColor={Colors.grey40}
                  />

                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Account Number</Text>
                  <TextInput
                    style={inputStyle}
                    value={formAccountNumber}
                    onChangeText={setFormAccountNumber}
                    placeholder="1234567890"
                    placeholderTextColor={Colors.grey40}
                    keyboardType="numeric"
                  />
                </>
              )}

              {/* E-Wallet Fields */}
              {formType === 'E_WALLET' && (
                <>
                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Wallet Provider</Text>
                  <TextInput
                    style={inputStyle}
                    value={formWalletProvider}
                    onChangeText={setFormWalletProvider}
                    placeholder="e.g., OVO, GoPay, Dana"
                    placeholderTextColor={Colors.grey40}
                  />

                  <Text text70 textColor marginB-10 style={{ fontWeight: 'bold' }}>Phone Number</Text>
                  <TextInput
                    style={inputStyle}
                    value={formWalletPhone}
                    onChangeText={setFormWalletPhone}
                    placeholder="08123456789"
                    placeholderTextColor={Colors.grey40}
                    keyboardType="phone-pad"
                  />
                </>
              )}

              {/* Set as Default */}
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}
                onPress={() => setFormIsDefault(!formIsDefault)}
              >
                <View
                  width={28}
                  height={28}
                  center
                  br100
                  marginR-12
                  style={{
                    borderWidth: 2,
                    borderColor: formIsDefault ? Colors.primaryColor : Colors.grey40,
                    backgroundColor: formIsDefault ? Colors.primaryColor : 'transparent'
                  }}
                >
                  {formIsDefault && (
                    <Ionicons name="checkmark" size={18} color="white" />
                  )}
                </View>
                <Text text70 textColor style={{ fontWeight: '600' }}>
                  Set as default payment method
                </Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: saving ? Colors.grey40 : Colors.primaryColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: Colors.primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: saving ? 0 : 0.3,
                  shadowRadius: 8,
                  elevation: saving ? 0 : 6,
                  marginBottom: 20
                }}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text text70 white style={{ fontWeight: 'bold' }}>
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 24,
            paddingHorizontal: 24,
            paddingVertical: 30,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8
          }}>
            <View
              width={70}
              height={70}
              center
              br100
              marginB-20
              style={{
                backgroundColor: '#ff4444' + '15',
                alignSelf: 'center'
              }}
            >
              <Ionicons name="warning" size={40} color="#ff4444" />
            </View>

            <Text text50 textColor center marginB-12 style={{ fontWeight: 'bold' }}>
              Delete Payment Method
            </Text>
            <Text text70 grey40 center marginB-30 style={{ lineHeight: 24 }}>
              Are you sure you want to delete "{deletingMethod?.name}"? This action cannot be undone.
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletingMethod(null);
                }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: Colors.grey80,
                  alignItems: 'center'
                }}
              >
                <Text text70 textColor style={{ fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmDelete}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: '#ff4444',
                  alignItems: 'center',
                  shadowColor: '#ff4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
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

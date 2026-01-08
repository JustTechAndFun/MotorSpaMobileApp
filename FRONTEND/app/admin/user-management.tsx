import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services';
import { AdminCreateUserRequest, User } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text, View, Colors, Card } from 'react-native-ui-lib';

export default function AdminUserManagementScreen() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<AdminCreateUserRequest>({
    phone: '',
    name: '',
    password: '',
    role: 'customer',
  });

  useEffect(() => {
    console.log('Admin check - currentUser:', currentUser);
    if (currentUser && currentUser.role !== 'admin') {
      console.log('Access denied - user role:', currentUser.role);
      toast.show({
        type: 'error',
        text1: 'Access Denied',
        text2: 'You don\'t have permission to access this page',
      });
      router.back();
    } else if (currentUser?.role === 'admin') {
      console.log('Access granted - user is admin');
    }
  }, [currentUser]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load users',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [currentUser, loadUsers]);

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  // Ban user
  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const confirmBanUser = async () => {
    if (!selectedUser) return;

    setShowBanModal(false);
    try {
      await userService.adminDeleteUser(selectedUser.id);
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User banned successfully',
      });
      loadUsers();
    } catch (error: any) {
      console.error('Error banning user:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to ban user',
      });
    } finally {
      setSelectedUser(null);
    }
  };

  // Create user
  const handleCreateUser = () => {
    setCreateForm({
      phone: '',
      name: '',
      password: '',
      role: 'customer',
    });
    setShowCreateModal(true);
  };

  const confirmCreateUser = async () => {
    // Validation
    if (!createForm.phone || !createForm.name || !createForm.password) {
      toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setShowCreateModal(false);
    try {
      await userService.adminCreateUser(createForm);
      toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'User created successfully',
      });
      loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create user',
      });
    }
  };

  // Render user item
  const renderUserItem = ({ item }: { item: User }) => (
    <Card
      padding-18
      marginB-16
      enableShadow
      style={{ borderRadius: 18 }}
    >
      <View row centerV>
        <View
          width={56}
          height={56}
          center
          br100
          marginR-16
          style={{
            backgroundColor: item.role === 'admin' ? Colors.primaryColor + '20' : Colors.grey80
          }}
        >
          {item.picture ? (
            <Text text50 style={{ color: Colors.primaryColor, fontWeight: 'bold' }}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          ) : (
            <Ionicons
              name="person"
              size={28}
              color={item.role === 'admin' ? Colors.primaryColor : Colors.grey40}
            />
          )}
        </View>

        <View flex>
          <Text text70 textColor style={{ fontWeight: 'bold' }}>
            {item.name}
          </Text>
          <Text text80 grey40 marginT-4>
            {item.phone}
          </Text>
          {item.email && (
            <Text text90 grey40 marginT-2>
              {item.email}
            </Text>
          )}
          <View
            paddingH-10
            paddingV-4
            marginT-8
            style={{
              backgroundColor: item.role === 'admin' ? '#FF9500' + '20' : Colors.primaryColor + '20',
              borderRadius: 10,
              alignSelf: 'flex-start'
            }}
          >
            <Text
              text90
              style={{
                color: item.role === 'admin' ? '#FF9500' : Colors.primaryColor,
                fontWeight: 'bold'
              }}
            >
              {item.role}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => handleBanUser(item)}
          disabled={item.id === currentUser?.id}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: item.id === currentUser?.id ? Colors.grey80 : '#FF3B30' + '15',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons
            name="ban-outline"
            size={22}
            color={item.id === currentUser?.id ? Colors.grey40 : '#FF3B30'}
          />
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (currentUser?.role !== 'admin') {
    return null;
  }

  return (
    <View flex bg-grey80>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View
        row
        centerV
        paddingH-16
        paddingT-5
        paddingB-14
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
        <Text text40 textColor flex style={{ fontWeight: 'bold' }}>User Management</Text>
        <TouchableOpacity
          onPress={handleCreateUser}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Colors.primaryColor + '20',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Ionicons name="add" size={28} color={Colors.primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View
        row
        paddingH-20
        paddingV-20
        bg-white
        marginB-4
        style={{ gap: 12 }}
      >
        <Card
          flex
          center
          paddingV-18
          enableShadow
          style={{ borderRadius: 16 }}
        >
          <Text text40 primaryColor style={{ fontWeight: 'bold' }}>
            {users.length}
          </Text>
          <Text text80 grey40 marginT-6 style={{ fontWeight: '600' }}>
            Total Users
          </Text>
        </Card>

        <Card
          flex
          center
          paddingV-18
          enableShadow
          style={{ borderRadius: 16 }}
        >
          <Text text40 style={{ color: '#FF9500', fontWeight: 'bold' }}>
            {users.filter(u => u.role === 'admin').length}
          </Text>
          <Text text80 grey40 marginT-6 style={{ fontWeight: '600' }}>
            Admins
          </Text>
        </Card>

        <Card
          flex
          center
          paddingV-18
          enableShadow
          style={{ borderRadius: 16 }}
        >
          <Text text40 style={{ color: '#007AFF', fontWeight: 'bold' }}>
            {users.filter(u => u.role === 'customer').length}
          </Text>
          <Text text80 grey40 marginT-6 style={{ fontWeight: '600' }}>
            Customers
          </Text>
        </Card>
      </View>

      {/* User List */}
      {loading ? (
        <View flex center>
          <ActivityIndicator size="large" color={Colors.primaryColor} />
          <Text text70 grey40 marginT-15 style={{ fontWeight: '500' }}>Loading users...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryColor]} />
          }
          ListEmptyComponent={
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
                <Ionicons name="people-outline" size={60} color={Colors.grey40} />
              </View>
              <Text text50 textColor center style={{ fontWeight: 'bold' }}>No users found</Text>
            </View>
          }
        />
      )}

      {/* Ban Confirmation Modal */}
      <Modal
        visible={showBanModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBanModal(false)}
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
                backgroundColor: '#FF3B30' + '15',
                alignSelf: 'center'
              }}
            >
              <Ionicons name="ban" size={40} color="#FF3B30" />
            </View>

            <Text text50 textColor center marginB-12 style={{ fontWeight: 'bold' }}>
              Ban User
            </Text>
            <Text text70 grey40 center marginB-30 style={{ lineHeight: 24 }}>
              Are you sure you want to ban user "{selectedUser?.name}"?
            </Text>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
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
                onPress={confirmBanUser}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: '#FF3B30',
                  alignItems: 'center',
                  shadowColor: '#FF3B30',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6
                }}
              >
                <Text text70 white style={{ fontWeight: 'bold' }}>Ban</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create User Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>
            <Text text60 textColor style={{ fontWeight: 'bold', marginBottom: 24 }}>Create New User</Text>

            {/* Phone Input */}
            <View style={{ marginBottom: 16 }}>
              <Text text80 textColor style={{ fontWeight: '600', marginBottom: 8 }}>Phone *</Text>
              <TextInput
                style={{
                  backgroundColor: Colors.grey80,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  fontSize: 15,
                  color: Colors.textColor
                }}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.grey50}
                value={createForm.phone}
                onChangeText={(text) => setCreateForm({ ...createForm, phone: text })}
                keyboardType="phone-pad"
              />
            </View>

            {/* Name Input */}
            <View style={{ marginBottom: 16 }}>
              <Text text80 textColor style={{ fontWeight: '600', marginBottom: 8 }}>Name *</Text>
              <TextInput
                style={{
                  backgroundColor: Colors.grey80,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  fontSize: 15,
                  color: Colors.textColor
                }}
                placeholder="Enter full name"
                placeholderTextColor={Colors.grey50}
                value={createForm.name}
                onChangeText={(text) => setCreateForm({ ...createForm, name: text })}
              />
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: 16 }}>
              <Text text80 textColor style={{ fontWeight: '600', marginBottom: 8 }}>Password *</Text>
              <TextInput
                style={{
                  backgroundColor: Colors.grey80,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  fontSize: 15,
                  color: Colors.textColor
                }}
                placeholder="Enter password"
                placeholderTextColor={Colors.grey50}
                value={createForm.password}
                onChangeText={(text) => setCreateForm({ ...createForm, password: text })}
                secureTextEntry
              />
            </View>

            {/* Role Selector */}
            <View style={{ marginBottom: 24 }}>
              <Text text80 textColor style={{ fontWeight: '600', marginBottom: 8 }}>Role *</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: createForm.role === 'customer' ? Colors.primaryColor : Colors.grey80,
                    alignItems: 'center'
                  }}
                  onPress={() => setCreateForm({ ...createForm, role: 'customer' })}
                >
                  <Text
                    text70
                    style={{
                      color: createForm.role === 'customer' ? 'white' : Colors.textColor,
                      fontWeight: 'bold'
                    }}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setCreateForm({ ...createForm, role: 'admin' })}
                  style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: createForm.role === 'admin' ? Colors.primaryColor : Colors.grey80,
                    alignItems: 'center'
                  }}
                >
                  <Text
                    text70
                    style={{
                      color: createForm.role === 'admin' ? 'white' : Colors.textColor,
                      fontWeight: 'bold'
                    }}
                  >
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                onPress={confirmCreateUser}
                activeOpacity={0.7}
                style={{
                  paddingVertical: 16,
                  borderRadius: 16,
                  backgroundColor: Colors.primaryColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: Colors.primaryColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                  marginBottom: 20
                }}
              >
                <Text text70 white style={{ fontWeight: 'bold' }}>Create User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

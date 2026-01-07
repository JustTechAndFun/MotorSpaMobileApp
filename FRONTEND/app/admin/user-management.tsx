import { useToast } from '@/components/toast';
import { useAuth } from '@/hooks/use-auth';
import { userService } from '@/services';
import { styles } from '@/styles/admin-user-management-styles';
import { AdminCreateUserRequest, User } from '@/types/api.types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';

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
    <View style={styles.userCard}>
      <View style={styles.userAvatar}>
        {item.picture ? (
          <Text style={styles.userAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        ) : (
          <Ionicons name="person" size={32} color="#666" />
        )}
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
        {item.email && <Text style={styles.userEmail}>{item.email}</Text>}
        <View style={styles.userRoleBadge}>
          <Text style={[
            styles.userRoleText,
            item.role === 'admin' && styles.adminRoleText
          ]}>
            {item.role}
          </Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.banButton}
          onPress={() => handleBanUser(item)}
          disabled={item.id === currentUser?.id}
        >
          <Ionicons 
            name="ban-outline" 
            size={22} 
            color={item.id === currentUser?.id ? '#CCC' : '#FF3B30'} 
          />
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={handleCreateUser} style={styles.headerRight}>
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === 'admin').length}
          </Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {users.filter(u => u.role === 'customer').length}
          </Text>
          <Text style={styles.statLabel}>Customers</Text>
        </View>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No users found</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ban User</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to ban user "{selectedUser?.name}"?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowBanModal(false);
                  setSelectedUser(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#E74C3C' }]}
                onPress={confirmBanUser}
              >
                <Text style={styles.banButtonText}>Ban</Text>
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.createModalContent]}>
            <Text style={styles.modalTitle}>Create New User</Text>
            
            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={createForm.phone}
                onChangeText={(text) => setCreateForm({...createForm, phone: text})}
                keyboardType="phone-pad"
              />
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={createForm.name}
                onChangeText={(text) => setCreateForm({...createForm, name: text})}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={createForm.password}
                onChangeText={(text) => setCreateForm({...createForm, password: text})}
                secureTextEntry
              />
            </View>

            {/* Role Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Role *</Text>
              <View style={styles.roleSelector}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    createForm.role === 'customer' && styles.roleButtonActive
                  ]}
                  onPress={() => setCreateForm({...createForm, role: 'customer'})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    createForm.role === 'customer' && styles.roleButtonTextActive
                  ]}>
                    Customer
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    createForm.role === 'admin' && styles.roleButtonActive
                  ]}
                  onPress={() => setCreateForm({...createForm, role: 'admin'})}
                >
                  <Text style={[
                    styles.roleButtonText,
                    createForm.role === 'admin' && styles.roleButtonTextActive
                  ]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#007AFF' }]}
                onPress={confirmCreateUser}
              >
                <Text style={styles.banButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

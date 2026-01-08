import { userService } from '@/services';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Text, View, Colors } from 'react-native-ui-lib';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter current password');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Password confirmation does not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    try {
      setIsLoading(true);
      await userService.changePassword(currentPassword, newPassword);

      Alert.alert('Success', 'Password changed successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Change password error:', error);
      Alert.alert(
        'Error',
        error.message || 'Unable to change password. Please check your current password.'
      );
    } finally {
      setIsLoading(false);
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
        <Text text40 textColor style={{ fontWeight: 'bold' }}>Change Password</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Password */}
        <Text text70 textColor marginB-12 style={{ fontWeight: 'bold' }}>Current Password</Text>
        <View
          row
          centerV
          paddingH-16
          paddingV-14
          marginB-24
          style={{
            backgroundColor: Colors.grey80,
            borderRadius: 16
          }}
        >
          <MaterialIcons name="lock-outline" size={22} color={Colors.grey40} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: Colors.textColor,
              marginLeft: 12,
              marginRight: 8
            }}
            placeholder="Enter current password"
            placeholderTextColor={Colors.grey40}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={Colors.grey40}
            />
          </TouchableOpacity>
        </View>

        {/* Divider with label */}
        <View marginB-24>
          <Text text80 style={{ color: Colors.primaryColor, fontWeight: 'bold' }}>
            ENTER NEW PASSWORD
          </Text>
        </View>

        {/* New Password */}
        <Text text70 textColor marginB-12 style={{ fontWeight: 'bold' }}>New Password</Text>
        <View
          row
          centerV
          paddingH-16
          paddingV-14
          marginB-24
          style={{
            backgroundColor: Colors.grey80,
            borderRadius: 16
          }}
        >
          <MaterialIcons name="lock-outline" size={22} color={Colors.grey40} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: Colors.textColor,
              marginLeft: 12,
              marginRight: 8
            }}
            placeholder="Enter new password (minimum 6 characters)"
            placeholderTextColor={Colors.grey40}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={Colors.grey40}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm New Password */}
        <Text text70 textColor marginB-12 style={{ fontWeight: 'bold' }}>Confirm New Password</Text>
        <View
          row
          centerV
          paddingH-16
          paddingV-14
          marginB-36
          style={{
            backgroundColor: Colors.grey80,
            borderRadius: 16
          }}
        >
          <MaterialIcons name="lock-outline" size={22} color={Colors.grey40} />
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: Colors.textColor,
              marginLeft: 12,
              marginRight: 8
            }}
            placeholder="Re-enter new password"
            placeholderTextColor={Colors.grey40}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ padding: 4 }}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={Colors.grey40}
            />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleChangePassword}
          disabled={isLoading}
          activeOpacity={0.7}
          style={{
            paddingVertical: 18,
            borderRadius: 18,
            backgroundColor: isLoading ? Colors.grey40 : Colors.primaryColor,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: Colors.primaryColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isLoading ? 0 : 0.3,
            shadowRadius: 8,
            elevation: isLoading ? 0 : 6
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text text60 white style={{ fontWeight: 'bold' }}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

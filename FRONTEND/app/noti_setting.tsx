import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Text, View } from 'react-native-ui-lib';
import { styles } from '../styles/noti-setting-styles';

/**
 * Single-file notification settings screen.
 */

interface ListItemProps {
  title: string;
  description?: string;
  initialValue?: boolean;
}

const ListItemWithSwitch = ({ title, description, initialValue = false }: ListItemProps) => {
  const [isEnabled, setIsEnabled] = useState(initialValue);
  return (
    <View style={styles.listItem}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      <Switch
        trackColor={{ false: '#E0E0E0', true: '#82cab2' }}
        thumbColor={isEnabled ? '#FFFFFF' : '#F4F3F4'}
        ios_backgroundColor="#E0E0E0"
        onValueChange={() => setIsEnabled(s => !s)}
        value={isEnabled}
      />
    </View>
  );
};

export default function NotiSettingScreen() {
  const router = useRouter();
  const [screen, setScreen] = useState<'menu' | 'app' | 'email'>('menu');

  const renderHeader = (title: string) => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          try {
            router.back();
          } catch {
            // no-op if history not available
          }
        }}
        style={styles.backButton}
      >
        <FontAwesome5 name="arrow-left" size={18} color="#333" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  if (screen === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader('Notifications')}
        <TouchableOpacity style={styles.menuItem} onPress={() => setScreen('app')}>
          <Text style={styles.menuText}>App Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => setScreen('email')}>
          <Text style={styles.menuText}>Email Notifications</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (screen === 'app') {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader('App Notifications')}
        <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingBottom: 40 }}>
          <ListItemWithSwitch title="App Notifications" initialValue={true} />
          <ListItemWithSwitch title="Notification Sound" initialValue={true} />
          <ListItemWithSwitch title="App Updates" initialValue={true} />
          <ListItemWithSwitch title="Promotions" initialValue={false} />
          <ListItemWithSwitch title="Chat" initialValue={true} />
          <ListItemWithSwitch title="Out of Stock Products" initialValue={false} />
          <ListItemWithSwitch title="Review Updates" initialValue={true} />
          <ListItemWithSwitch title="Content Changes" initialValue={false} />
          <ListItemWithSwitch title="Follows" initialValue={true} />
          <ListItemWithSwitch title="Likes & Comments" initialValue={true} />
          <View style={{ height: 50 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader('Email Notifications')}
      <ScrollView style={styles.pageContainer} contentContainerStyle={{ paddingBottom: 40 }}>
        <ListItemWithSwitch title="Email Notifications" initialValue={true} />
        <ListItemWithSwitch
          title="Order Updates"
          description="Notify me about updates to my orders, including payment information."
          initialValue={true}
        />
        <ListItemWithSwitch
          title="Subscription Emails"
          description="Send me updates about products, trends, and special offers."
          initialValue={false}
        />
        <ListItemWithSwitch title="Change Email Notification Content" initialValue={true} />
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
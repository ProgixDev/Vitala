import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DrawerFooterProps {
  onLogout: () => void;
  appVersion?: string;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({
  onLogout,
  appVersion = '1.0.0',
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
        activeOpacity={0.7}
      >
        <View style={styles.logoutContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version {appVersion}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  logoutButton: {
    paddingVertical: 16,
    marginBottom: 16,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  versionContainer: {
    paddingLeft: 48,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});


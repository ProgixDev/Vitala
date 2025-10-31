import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DrawerItemProps {
  label: string;
  icon: string;
  onPress: () => void;
  isActive?: boolean;
}

export const DrawerItem: React.FC<DrawerItemProps> = ({
  label,
  icon,
  onPress,
  isActive = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon as any}
            size={24}
            color="#FFFFFF"
          />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.8)" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  activeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});


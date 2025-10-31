import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDrawer } from '../drawer/DrawerProvider';

interface DrawerToggleButtonProps {
  color?: string;
  size?: number;
}

export const DrawerToggleButton: React.FC<DrawerToggleButtonProps> = ({
  color = '#2D59F0',
  size = 28,
}) => {
  const { toggleDrawer } = useDrawer();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={toggleDrawer}
      activeOpacity={0.7}
    >
      <Ionicons name="menu" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});


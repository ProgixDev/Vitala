import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerHeader } from './components/DrawerHeader';
import { DrawerItem } from './components/DrawerItem';
import { DrawerFooter } from './components/DrawerFooter';
import { useDrawerMenu } from './hooks/useDrawerMenu';

interface CustomDrawerContentProps {
  onClose?: () => void;
  userName?: string;
  userID?: string;
  userAvatar?: string;
}

export const DrawerContent: React.FC<CustomDrawerContentProps> = ({
  onClose,
  userName,
  userID,
  userAvatar,
}) => {
  const { menuItems, handleMenuItemPress, handleLogout, isMenuItemActive } = useDrawerMenu();

  return (
    <View style={styles.container}>
      {/* Header with user info */}
      <DrawerHeader
        userName={userName}
        userID={userID}
        userAvatar={userAvatar}
        onClose={onClose}
      />

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <DrawerItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            onPress={() => handleMenuItemPress(item.route)}
            isActive={isMenuItemActive(item.route)}
          />
        ))}
      </ScrollView>

      {/* Footer with logout */}
      <DrawerFooter onLogout={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D59F0',
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 8,
  },
});


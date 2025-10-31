import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { menuItems, MenuItem } from '../constants/menuItems';

export const useDrawerMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeRoute, setActiveRoute] = useState<string>(pathname);

  const handleMenuItemPress = useCallback((route: string) => {
    setActiveRoute(route);
    // Navigate to the drawer group routes
    const drawerRoute = route.replace('/', '/(drawer)/');
    router.push(drawerRoute as any);
  }, [router]);

  const handleLogout = useCallback(async () => {
    // TODO: Add logout logic (clear tokens, user data, etc.)
    console.log('Logging out...');
    
    // Clear any stored data
    // await AsyncStorage.clear();
    
    // Navigate to signin
    router.replace('/signin' as any);
  }, [router]);

  const getMenuItems = useCallback(() => {
    return menuItems;
  }, []);

  const isMenuItemActive = useCallback((route: string) => {
    return activeRoute === route || pathname === route;
  }, [activeRoute, pathname]);

  return {
    menuItems: getMenuItems(),
    activeRoute,
    handleMenuItemPress,
    handleLogout,
    isMenuItemActive,
  };
};


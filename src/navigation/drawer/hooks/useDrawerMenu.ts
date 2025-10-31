import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { menuItems, MenuItem } from '../constants/menuItems';

export const useDrawerMenu = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeRoute, setActiveRoute] = useState<string>(pathname);

  const handleMenuItemPress = useCallback((route: string) => {
    setActiveRoute(route);

    // Map drawer routes to tab routes
    const routeMapping: Record<string, string> = {
      '/home': '/(tabs)',
      '/schedules': '/(tabs)/schedule',
      '/family-members': '/(tabs)/profile', // Map to profile tab
      '/payments': '/(tabs)/profile', // Map to profile tab
      '/medical-records': '/(tabs)/profile', // Map to profile tab
      '/privacy-policy': '/(tabs)/profile', // Map to profile tab
      '/help-center': '/(tabs)/profile', // Map to profile tab
      '/settings': '/(tabs)/profile', // Map to profile tab
    };

    const targetRoute = routeMapping[route] || '/(tabs)';
    router.push(targetRoute as any);
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


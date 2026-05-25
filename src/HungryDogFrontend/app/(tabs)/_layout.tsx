import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HungryDogColors } from '@/constants/colors';
import { getStoredItem } from '@/services/storage';

type TabIconProps = {
  focused: boolean;
  color: string;
  name: React.ComponentProps<typeof MaterialIcons>['name'];
};

function TabIcon({ focused, color, name }: TabIconProps) {
  // Aktiv tab får en lys baggrund, så navigationen er tydelig på mobil.
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <MaterialIcons name={name} size={21} color={focused ? HungryDogColors.primary : color} />
    </View>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getStoredItem('token');
        if (!token) {
          // Tabs er private, så brugeren sendes til login uden token.
          router.replace('/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isChecking || !isAuthenticated) {
    // Skjuler tabbar kortvarigt mens auth-status kontrolleres.
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: HungryDogColors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="add-dog"
        options={{
          title: 'ADD',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="add-circle" />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'STATS',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="show-chart" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon focused={focused} color={color} name="person" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: HungryDogColors.border,
    borderTopWidth: 1,
    height: 76,
    paddingBottom: 10,
    paddingTop: 8,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconWrapActive: {
    backgroundColor: '#DFF7E6',
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
  },
});

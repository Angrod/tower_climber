import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

// IMPORTANT: iOS 26 uses NativeTabs for native tabs with liquid glass support.
// NativeTabs intentionally does NOT use custom design tokens — liquid glass
// is a system-level appearance provided by iOS and cannot be overridden.
// Custom brand colors are applied only on the ClassicTabLayout path (older iOS / Android / web).
function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'flame', selected: 'flame.fill' }} />
        <Label>Climb</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="heroes">
        <Icon sf={{ default: 'person.3', selected: 'person.3.fill' }} />
        <Label>Heroes</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="soldiers">
        <Icon sf={{ default: 'shield', selected: 'shield.fill' }} />
        <Label>Soldiers</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="weapons">
        <Icon sf={{ default: 'bolt', selected: 'bolt.fill' }} />
        <Label>Weapons</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="shop">
        <Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
        <Label>Shop</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Climb',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="fire" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="heroes"
        options={{
          title: 'Heroes',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account-group" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="soldiers"
        options={{
          title: 'Soldiers',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="shield-account" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weapons"
        options={{
          title: 'Weapons',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="sword-cross" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="treasure-chest" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}

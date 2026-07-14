import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface AutoAttackToggleProps {
  unlocked: boolean;
  active: boolean;
  unlockFloor: number;
  onToggle: () => void;
}

export function AutoAttackToggle({
  unlocked,
  active,
  unlockFloor,
  onToggle,
}: AutoAttackToggleProps) {
  const colors = useColors();

  if (!unlocked) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.secondary, borderColor: colors.border },
        ]}
      >
        <MaterialCommunityIcons
          name="lock-outline"
          size={18}
          color={colors.mutedForeground}
        />
        <Text style={[styles.lockedText, { color: colors.mutedForeground }]}>
          Auto-Attack unlocks at Floor {unlockFloor}
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="button"
      testID="auto-attack-toggle"
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: active ? colors.primary : colors.card,
          borderColor: active ? colors.primary : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={active ? 'pause-circle' : 'play-circle'}
        size={20}
        color={active ? colors.primaryForeground : colors.foreground}
      />
      <Text
        style={[
          styles.activeText,
          { color: active ? colors.primaryForeground : colors.foreground },
        ]}
      >
        {active ? 'Auto-Attack: On' : 'Auto-Attack: Off'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  lockedText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  activeText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});

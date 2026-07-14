import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';
import { GEAR_TIER_COLORS } from '@/constants/gearTierStyles';
import type { WeaponDefinition } from '@/lib/engine/gearData';
import { GEAR_TIER_LABELS } from '@/lib/engine/gearData';
import { getItemBonusPercent } from '@/lib/engine/gearFormulas';

interface GearCardProps {
  definition: WeaponDefinition;
  level: number | null;
  equipped: boolean;
  onPress: () => void;
}

/** A single TCG-style binder slot: locked silhouette when undiscovered, full art + level + tier border once owned. */
export function GearCard({ definition, level, equipped, onPress }: GearCardProps) {
  const colors = useColors();
  const owned = level !== null;
  const tierColor = GEAR_TIER_COLORS[definition.tier];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: owned ? tierColor : colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      {equipped && (
        <View style={[styles.equippedDot, { backgroundColor: colors.primary }]} />
      )}
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: owned ? `${tierColor}26` : colors.secondary,
            borderColor: owned ? tierColor : colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            owned
              ? (definition.icon as keyof typeof MaterialCommunityIcons.glyphMap)
              : 'help'
          }
          size={24}
          color={owned ? tierColor : colors.mutedForeground}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: owned ? colors.foreground : colors.mutedForeground },
        ]}
      >
        {owned ? definition.name : gameCopy.weaponsUndiscoveredLabel}
      </Text>
      <Text style={[styles.tierLabel, { color: owned ? tierColor : colors.mutedForeground }]}>
        {GEAR_TIER_LABELS[definition.tier]}
      </Text>
      {owned && (
        <Text style={[styles.level, { color: colors.mutedForeground }]}>
          {gameCopy.weaponsLevelLabel(level as number)} · +
          {getItemBonusPercent(definition, level as number).toFixed(1)}%
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '31%',
    borderRadius: 14,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  equippedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  tierLabel: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  level: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
});

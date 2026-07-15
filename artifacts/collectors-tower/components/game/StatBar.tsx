import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';

interface StatBarProps {
  floor: number;
  attackPower: number;
  floorsCleared: number;
  activeHeroes: number;
  maxHeroes: number;
}

function StatPill({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  tint: string;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={16} color={tint} />
      <View>
        <Text style={[styles.pillLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text style={[styles.pillValue, { color: colors.foreground }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function StatBar({
  floor,
  attackPower,
  floorsCleared,
  activeHeroes,
  maxHeroes,
}: StatBarProps) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <StatPill
        icon="office-building-marker"
        label="Floor"
        value={String(floor)}
        tint={colors.primary}
      />
      <StatPill
        icon="sword"
        label={gameCopy.attackShortLabel}
        value={String(attackPower)}
        tint={colors.destructive}
      />
      <StatPill
        icon="account-group"
        label="Heroes"
        value={`${activeHeroes}/${maxHeroes}`}
        tint={colors.mutedForeground}
      />
      <StatPill
        icon="trophy-outline"
        label="Cleared"
        value={String(floorsCleared)}
        tint={colors.mutedForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  pillLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  pillValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});

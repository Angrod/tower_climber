import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';
import type { SoldierDefinition } from '@/lib/engine/soldierData';
import {
  getSoldierPower,
  getSoldierWallLevel,
  isSoldierAtWall,
} from '@/lib/engine/soldierFormulas';

interface SoldierCardProps {
  definition: SoldierDefinition;
  level: number;
  gold: number;
  actionCost: number;
  onPressAction: () => void;
}

export function SoldierCard({
  definition,
  level,
  gold,
  actionCost,
  onPressAction,
}: SoldierCardProps) {
  const colors = useColors();
  const recruited = level > 0;
  const atWall = recruited && isSoldierAtWall(level);
  const wallLevel = atWall ? getSoldierWallLevel(level) : null;
  const power = getSoldierPower(definition, level);
  const canAfford = gold >= actionCost;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: recruited ? colors.accent : colors.secondary,
            borderColor: colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={definition.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={26}
          color={recruited ? colors.primary : colors.mutedForeground}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {definition.name}
          </Text>
          {atWall && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text
                style={[styles.badgeText, { color: colors.primaryForeground }]}
              >
                {gameCopy.soldierMaxLevelLabel(wallLevel ?? level)}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>
          {definition.role}
        </Text>
        {recruited ? (
          <Text style={[styles.stat, { color: colors.mutedForeground }]}>
            {gameCopy.soldierLevelLabel(level)} · {gameCopy.soldierPowerLabel}{' '}
            {power}
          </Text>
        ) : (
          <Text style={[styles.stat, { color: colors.mutedForeground }]}>
            {gameCopy.notRecruitedLabel}
          </Text>
        )}
      </View>

      {!atWall && (
        <Pressable
          onPress={onPressAction}
          disabled={!canAfford}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: canAfford ? colors.primary : colors.secondary,
              opacity: pressed && canAfford ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: canAfford
                  ? colors.primaryForeground
                  : colors.mutedForeground,
              },
            ]}
          >
            {recruited
              ? gameCopy.levelUpButtonLabel(actionCost)
              : gameCopy.recruitButtonLabel(actionCost)}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  role: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  stat: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
});

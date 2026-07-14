import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';
import { GEAR_TIER_COLORS } from '@/constants/gearTierStyles';
import { getWeaponDefinition } from '@/lib/engine/gearData';
import type { GearDropToast } from '@/context/GameContext';

interface GearDropToastBannerProps {
  toast: GearDropToast | null;
}

/** Transient banner for a loot-chest drop — new item vs. a level-up of one already owned. */
export function GearDropToastBanner({ toast }: GearDropToastBannerProps) {
  const colors = useColors();
  if (!toast) return null;

  const def = getWeaponDefinition(toast.itemId);
  if (!def) return null;

  const tierColor = GEAR_TIER_COLORS[def.tier];

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(220)}
      style={[styles.banner, { backgroundColor: tierColor, shadowColor: tierColor }]}
    >
      <MaterialCommunityIcons
        name={def.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={18}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {toast.isNew
          ? gameCopy.weaponsDropNewLabel(def.name)
          : gameCopy.weaponsDropLeveledUpLabel(def.name, toast.level)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';

/**
 * A slim, static banner ad slot. Deliberately small and non-blocking —
 * it never overlays the tap target or gameplay controls. Renders
 * nothing once the ad-free buyout is owned (see GameContext.adsRemoved).
 *
 * No live ad network is connected yet, so this shows placeholder
 * content. Swap the inner content for a real ad SDK's banner view once
 * an ad network integration is connected; the visibility gating on
 * `adsRemoved` should stay exactly as-is.
 */
export function BannerAdSlot() {
  const colors = useColors();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.muted, borderColor: colors.border }]}
    >
      <MaterialCommunityIcons name="bullhorn-outline" size={14} color={colors.mutedForeground} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {gameCopy.bannerAdLabel} · {gameCopy.bannerAdPlaceholder}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
});

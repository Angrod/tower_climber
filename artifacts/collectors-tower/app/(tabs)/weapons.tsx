import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { gameCopy } from '@/constants/gameCopy';
import { GEAR_TIER_COLORS } from '@/constants/gearTierStyles';
import {
  GEAR_TIER_LABELS,
  GEAR_TIER_ORDER,
  WEAPON_ROSTER,
  weaponsByTier,
  type WeaponDefinition,
} from '@/lib/engine/gearData';
import { getEquippedFamilyTotals, getGearAttackMultiplier } from '@/lib/engine/gearFormulas';
import { GearCard } from '@/components/game/GearCard';
import { GearDetailModal } from '@/components/game/GearDetailModal';
import { GearDropToastBanner } from '@/components/game/GearDropToastBanner';

export default function WeaponsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, isLoaded, gearDropToast, equipGear, unequipGear } = useGame();
  const [selected, setSelected] = useState<WeaponDefinition | null>(null);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const ownedCount = useMemo(
    () => Object.keys(state.gear?.owned ?? {}).length,
    [state.gear],
  );

  if (!isLoaded) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const gearMultiplier = getGearAttackMultiplier(state.gear);
  const familyTotals = getEquippedFamilyTotals(state.gear);

  const selectedLevel = selected ? state.gear.owned[selected.id]?.level ?? null : null;
  const selectedEquipped = selected ? state.gear.equippedIds.includes(selected.id) : false;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <GearDropToastBanner toast={gearDropToast} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: insets.bottom + webBottomInset + 16,
          },
        ]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {gameCopy.weaponsTitle}
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {gameCopy.weaponsSubtitle} ·{' '}
              {gameCopy.weaponsOwnedCountLabel(ownedCount, WEAPON_ROSTER.length)}
            </Text>
          </View>
          <View
            style={[
              styles.multiplierPill,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons name="infinity" size={16} color={colors.primary} />
            <View>
              <Text style={[styles.multiplierLabel, { color: colors.mutedForeground }]}>
                {gameCopy.weaponsMultiplierLabel}
              </Text>
              <Text style={[styles.multiplierValue, { color: colors.foreground }]}>
                ×{gearMultiplier.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {familyTotals.length > 0 && (
          <View style={styles.familyRow}>
            {familyTotals.map((family) => (
              <View
                key={family.familyId}
                style={[
                  styles.familyChip,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.familyChipText, { color: colors.foreground }]}>
                  {family.familyName} ×{family.multiplier.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {GEAR_TIER_ORDER.map((tier) => {
          const items = weaponsByTier(tier);
          if (items.length === 0) return null;
          const tierColor = GEAR_TIER_COLORS[tier];

          return (
            <View key={tier} style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  {GEAR_TIER_LABELS[tier]}
                </Text>
              </View>
              <View style={styles.grid}>
                {items.map((definition) => {
                  const itemState = state.gear.owned[definition.id];
                  return (
                    <GearCard
                      key={definition.id}
                      definition={definition}
                      level={itemState?.level ?? null}
                      equipped={state.gear.equippedIds.includes(definition.id)}
                      onPress={() => setSelected(definition)}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <GearDetailModal
        visible={!!selected}
        definition={selected}
        level={selectedLevel}
        equipped={selectedEquipped}
        gear={state.gear}
        onEquip={() => selected && equipGear(selected.id)}
        onUnequip={() => selected && unequipGear(selected.id)}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  multiplierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  multiplierLabel: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
  },
  multiplierValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  familyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  familyChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  familyChipText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  section: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '3.5%',
    rowGap: 10,
  },
});

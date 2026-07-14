import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';
import { GEAR_TIER_COLORS } from '@/constants/gearTierStyles';
import { GEAR_TIER_LABELS, type WeaponDefinition } from '@/lib/engine/gearData';
import {
  getEquippedFamilyTotals,
  getGearAttackMultiplier,
  getItemBonusPercent,
  previewMultiplierAfterToggle,
} from '@/lib/engine/gearFormulas';
import type { GearState } from '@/lib/engine/types';

interface GearDetailModalProps {
  visible: boolean;
  definition: WeaponDefinition | null;
  level: number | null;
  equipped: boolean;
  gear: GearState;
  onEquip: () => void;
  onUnequip: () => void;
  onClose: () => void;
}

/**
 * Full detail + equip/compare view for one gear item. Shows the
 * item's own family and, when owned, previews how equipping/unequipping
 * it changes the overall gear attack multiplier — the "how it stacks
 * with what you already own" requirement.
 */
export function GearDetailModal({
  visible,
  definition,
  level,
  equipped,
  gear,
  onEquip,
  onUnequip,
  onClose,
}: GearDetailModalProps) {
  const colors = useColors();
  if (!definition) return null;

  const owned = level !== null;
  const tierColor = GEAR_TIER_COLORS[definition.tier];
  const currentMultiplier = getGearAttackMultiplier(gear);
  const previewMultiplier = owned
    ? previewMultiplierAfterToggle(gear, definition.id)
    : currentMultiplier;
  const familyTotals = getEquippedFamilyTotals(gear);
  const thisFamily = familyTotals.find((f) => f.familyId === definition.familyId);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: tierColor }]}
        >
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${tierColor}26`, borderColor: tierColor },
            ]}
          >
            <MaterialCommunityIcons
              name={
                owned
                  ? (definition.icon as keyof typeof MaterialCommunityIcons.glyphMap)
                  : 'help'
              }
              size={34}
              color={tierColor}
            />
          </View>

          <Text style={[styles.name, { color: colors.foreground }]}>
            {owned ? definition.name : gameCopy.weaponsUndiscoveredLabel}
          </Text>
          <Text style={[styles.tierLabel, { color: tierColor }]}>
            {GEAR_TIER_LABELS[definition.tier]} · {definition.familyName}
          </Text>

          {!owned && (
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              {gameCopy.weaponsUndiscoveredBody}
            </Text>
          )}

          {owned && (
            <>
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statPill,
                    { backgroundColor: colors.accent, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                    {gameCopy.weaponsLevelLabel(level as number)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statPill,
                    { backgroundColor: colors.accent, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                    {gameCopy.weaponsFamilyBonusLabel(
                      getItemBonusPercent(definition, level as number).toFixed(1),
                    )}
                  </Text>
                </View>
              </View>

              {thisFamily && (
                <Text style={[styles.body, { color: colors.mutedForeground }]}>
                  {definition.familyName}:{' '}
                  {gameCopy.weaponsFamilyMultiplierLabel(thisFamily.multiplier.toFixed(2))}{' '}
                  ({thisFamily.summedBonusPercent.toFixed(1)}% summed across equipped items in
                  this family)
                </Text>
              )}

              <Text style={[styles.compareBody, { color: colors.primary }]}>
                {equipped
                  ? gameCopy.weaponsCompareIfUnequippedLabel(previewMultiplier.toFixed(2))
                  : gameCopy.weaponsCompareIfEquippedLabel(previewMultiplier.toFixed(2))}
              </Text>

              <Pressable
                onPress={equipped ? onUnequip : onEquip}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: equipped ? colors.secondary : colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    { color: equipped ? colors.foreground : colors.primaryForeground },
                  ]}
                >
                  {equipped ? gameCopy.weaponsUnequipLabel : gameCopy.weaponsEquipLabel}
                </Text>
              </Pressable>
            </>
          )}

          <Pressable onPress={onClose} accessibilityRole="button" style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.mutedForeground }]}>
              {gameCopy.weaponsCloseLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  tierLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 19,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  statPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  compareBody: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginTop: 4,
  },
  actionButton: {
    marginTop: 10,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    marginTop: 6,
  },
  closeText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
});

import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { gameCopy } from '@/constants/gameCopy';
import {
  getHeroRank,
  getMaxConcurrentHeroes,
  getNextHeroRank,
  getSummonSkillUpgradeCost,
  getVariantSkillUpgradeCost,
  getVariantSpawnChance,
} from '@/lib/engine/heroFormulas';

export default function HeroesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, isLoaded, upgradeSummonSkill, upgradeVariantSkill } = useGame();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  if (!isLoaded) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const { heroes, gold } = state;
  const activeCount = heroes.instances.filter((hero) => hero.active).length;
  const maxConcurrent = getMaxConcurrentHeroes(heroes.summonSkillLevel);
  const rank = getHeroRank(heroes.level);
  const nextRank = getNextHeroRank(heroes.level);

  const summonCost = getSummonSkillUpgradeCost(heroes.summonSkillLevel);
  const canAffordSummon = gold >= summonCost;

  const variantCost = getVariantSkillUpgradeCost(heroes.variantSkillLevel);
  const canAffordVariant = gold >= variantCost;
  const variantPercent = (getVariantSpawnChance(heroes.variantSkillLevel) * 100).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.title, { color: colors.foreground }]}>{gameCopy.heroesTitle}</Text>
          <View
            style={[styles.goldPill, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <MaterialCommunityIcons name="circle-multiple" size={16} color={colors.primary} />
            <Text style={[styles.goldValue, { color: colors.foreground }]}>{gold}</Text>
          </View>
        </View>

        {/* Rank / concurrent overview */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.overviewRow}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.accent, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="account-group" size={26} color={colors.primary} />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>
                {gameCopy.heroesConcurrentLabel}
              </Text>
              <Text style={[styles.overviewValue, { color: colors.foreground }]}>
                {gameCopy.heroesConcurrentValue(activeCount, maxConcurrent)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.overviewRow}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.accent, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="crown" size={26} color={colors.primary} />
            </View>
            <View style={styles.overviewInfo}>
              <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>
                {gameCopy.heroesRankLabel}
              </Text>
              <Text style={[styles.overviewValue, { color: colors.foreground }]}>{rank.name}</Text>
              <Text style={[styles.overviewSub, { color: colors.mutedForeground }]}>
                {gameCopy.heroesLevelLabel(heroes.level)}
                {' · '}
                {nextRank
                  ? gameCopy.heroesNextRankLabel(nextRank.name, nextRank.levelBreakpoint)
                  : gameCopy.heroesMaxRankLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Summon skill */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.accent, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="bugle" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {gameCopy.heroesSummonSkillCardTitle}
              </Text>
              <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                {gameCopy.heroesSummonSkillCardBody(maxConcurrent)}
              </Text>
              <Text style={[styles.cardSkillLevel, { color: colors.mutedForeground }]}>
                {gameCopy.heroesSkillLevelLabel(heroes.summonSkillLevel)}
              </Text>
            </View>
          </View>
          <PressableUpgradeButton
            label={gameCopy.heroesUpgradeButtonLabel(summonCost)}
            canAfford={canAffordSummon}
            onPress={upgradeSummonSkill}
          />
        </View>

        {/* Rare variant skill */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.accent, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="fire" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {gameCopy.heroesVariantSkillCardTitle}
              </Text>
              <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                {gameCopy.heroesVariantSkillCardBody(variantPercent)}
              </Text>
              <Text style={[styles.cardSkillLevel, { color: colors.mutedForeground }]}>
                {gameCopy.heroesSkillLevelLabel(heroes.variantSkillLevel)}
              </Text>
            </View>
          </View>
          <PressableUpgradeButton
            label={gameCopy.heroesUpgradeButtonLabel(variantCost)}
            canAfford={canAffordVariant}
            onPress={upgradeVariantSkill}
          />
        </View>

        <Text style={[styles.hint, { color: colors.mutedForeground }]}>{gameCopy.heroesHintLabel}</Text>
      </ScrollView>
    </View>
  );
}

function PressableUpgradeButton({
  label,
  canAfford,
  onPress,
}: {
  label: string;
  canAfford: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.actionRow}>
      <Pressable
        onPress={onPress}
        disabled={!canAfford}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.actionButtonWrap,
          {
            backgroundColor: canAfford ? colors.primary : colors.secondary,
            opacity: pressed && canAfford ? 0.85 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.actionButtonText,
            { color: canAfford ? colors.primaryForeground : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  goldPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  goldValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overviewInfo: {
    flex: 1,
    gap: 2,
  },
  overviewLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  overviewValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  overviewSub: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  cardBody: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    lineHeight: 16,
  },
  cardSkillLevel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  actionRow: {
    alignItems: 'flex-start',
  },
  actionButtonWrap: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginTop: 4,
  },
});

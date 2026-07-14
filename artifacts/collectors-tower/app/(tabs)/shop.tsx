import React, { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { gameCopy } from '@/constants/gameCopy';
import {
  BOOST_COST,
  BOOST_DURATION_MS,
  BOOST_MULTIPLIER,
  FIRE_SWORD_COST,
  REWARDED_AD_REWARD,
  boostMsRemaining,
  canClaimDailyLogin,
  DAILY_LOGIN_REWARD,
  isBoostActive,
} from '@/lib/engine/shopFormulas';
import { AD_FREE_BUYOUT_PRICE_LABEL, purchaseAdFreeBuyout } from '@/lib/purchases';
import { BannerAdSlot } from '@/components/ads/BannerAdSlot';
import { RewardedAdModal } from '@/components/ads/RewardedAdModal';
import { PurchaseConfirmModal } from '@/components/ads/PurchaseConfirmModal';

/** Re-renders once a second while a boost is active so the countdown stays live. */
function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);
  return now;
}

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    state,
    isLoaded,
    purchaseBoost,
    purchaseFireSword,
    grantRewardedAdReward,
    markAdsRemoved,
  } = useGame();

  const now = useNow(1000);
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  if (!isLoaded) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const boostActive = isBoostActive(state, now);
  const boostSecondsLeft = Math.ceil(boostMsRemaining(state, now) / 1000);
  const dailyClaimable = canClaimDailyLogin(state, now);
  const canAffordBoost = state.shopCurrency >= BOOST_COST;
  const canAffordFireSword = state.shopCurrency >= FIRE_SWORD_COST;

  const handleConfirmPurchase = async () => {
    setIsPurchasing(true);
    try {
      const result = await purchaseAdFreeBuyout();
      if (result.success) {
        markAdsRemoved();
      }
    } finally {
      setIsPurchasing(false);
      setPurchaseModalVisible(false);
    }
  };

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
          <Text style={[styles.title, { color: colors.foreground }]}>{gameCopy.shopTitle}</Text>
          <View style={styles.currencyPills}>
            <View
              style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons
                name="circle-multiple"
                size={15}
                color={colors.primary}
              />
              <Text style={[styles.pillValue, { color: colors.foreground }]}>{state.gold}</Text>
            </View>
            <View
              style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="star-four-points" size={15} color={colors.primary} />
              <Text style={[styles.pillValue, { color: colors.foreground }]}>
                {state.shopCurrency}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily login */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.accent, borderColor: colors.border },
              ]}
            >
              <MaterialCommunityIcons name="calendar-star" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {gameCopy.dailyLoginCardTitle}
              </Text>
              <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                {dailyClaimable
                  ? gameCopy.dailyLoginAvailableBody(DAILY_LOGIN_REWARD)
                  : gameCopy.dailyLoginClaimedBody}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: dailyClaimable ? colors.primary : colors.secondary },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: dailyClaimable ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {dailyClaimable ? gameCopy.claimLabel : gameCopy.claimedLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Ads */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {gameCopy.adsSectionTitle}
          </Text>

          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons
                  name="play-circle-outline"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {gameCopy.rewardedAdCardTitle}
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                  {gameCopy.rewardedAdCardBody(REWARDED_AD_REWARD)}
                </Text>
              </View>
              <Pressable
                onPress={() => setAdModalVisible(true)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={[styles.actionText, { color: colors.primaryForeground }]}>
                  {gameCopy.watchAdLabel}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons
                  name={state.adsRemoved ? 'shield-check' : 'shield-off-outline'}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {gameCopy.adFreeCardTitle}
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                  {state.adsRemoved
                    ? gameCopy.adFreeOwnedBody
                    : gameCopy.adFreeCardBody(AD_FREE_BUYOUT_PRICE_LABEL)}
                </Text>
              </View>
              {!state.adsRemoved && (
                <Pressable
                  onPress={() => setPurchaseModalVisible(true)}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={[styles.actionText, { color: colors.primaryForeground }]}>
                    {gameCopy.removeAdsLabel(AD_FREE_BUYOUT_PRICE_LABEL)}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {!state.adsRemoved && <BannerAdSlot />}
        </View>

        {/* Gold */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {gameCopy.goldSectionTitle}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
            {gameCopy.goldSectionSubtitle}
          </Text>

          <Pressable
            onPress={() => router.push('/soldiers')}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons name="shield-account" size={22} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {gameCopy.soldierUpgradesCardTitle}
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                  {gameCopy.soldierUpgradesCardBody}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.mutedForeground}
              />
            </View>
          </Pressable>

          <View
            style={[
              styles.card,
              styles.comingSoonCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-group"
                  size={22}
                  color={colors.mutedForeground}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
                  {gameCopy.heroUpgradesCardTitle}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.statusBadgeText, { color: colors.mutedForeground }]}>
                  {gameCopy.comingSoonLabel}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.card,
              styles.comingSoonCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.secondary, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons
                  name="lightning-bolt-outline"
                  size={22}
                  color={colors.mutedForeground}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>
                  {gameCopy.skillUpgradesCardTitle}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.statusBadgeText, { color: colors.mutedForeground }]}>
                  {gameCopy.comingSoonLabel}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shop Currency */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {gameCopy.shopCurrencySectionTitle}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.mutedForeground }]}>
            {gameCopy.shopCurrencySectionSubtitle}
          </Text>

          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons name="lightning-bolt" size={22} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {gameCopy.boostCardTitle}
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                  {boostActive
                    ? gameCopy.boostActiveBody(boostSecondsLeft)
                    : gameCopy.boostCardBody(BOOST_MULTIPLIER, BOOST_DURATION_MS / 1000)}
                </Text>
              </View>
              <Pressable
                onPress={purchaseBoost}
                disabled={!canAffordBoost}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.actionButton,
                  {
                    backgroundColor: canAffordBoost ? colors.primary : colors.secondary,
                    opacity: pressed && canAffordBoost ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.actionText,
                    {
                      color: canAffordBoost ? colors.primaryForeground : colors.mutedForeground,
                    },
                  ]}
                >
                  {gameCopy.buyBoostLabel(BOOST_COST)}
                </Text>
              </Pressable>
            </View>
          </View>

          <View
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.accent, borderColor: colors.border },
                ]}
              >
                <MaterialCommunityIcons
                  name="sword-cross"
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {gameCopy.fireSwordCardTitle}
                </Text>
                <Text style={[styles.cardBody, { color: colors.mutedForeground }]}>
                  {gameCopy.fireSwordCardBody}
                </Text>
              </View>
              {state.fireSwordOwned ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.statusBadgeText, { color: colors.primaryForeground }]}>
                    {gameCopy.fireSwordOwnedLabel}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={purchaseFireSword}
                  disabled={!canAffordFireSword}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      backgroundColor: canAffordFireSword ? colors.primary : colors.secondary,
                      opacity: pressed && canAffordFireSword ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      {
                        color: canAffordFireSword
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      },
                    ]}
                  >
                    {gameCopy.buyFireSwordLabel(FIRE_SWORD_COST)}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <RewardedAdModal
        visible={adModalVisible}
        rewardAmount={REWARDED_AD_REWARD}
        onComplete={grantRewardedAdReward}
        onClose={() => setAdModalVisible(false)}
      />

      <PurchaseConfirmModal
        visible={purchaseModalVisible}
        priceLabel={AD_FREE_BUYOUT_PRICE_LABEL}
        isPurchasing={isPurchasing}
        onConfirm={handleConfirmPurchase}
        onCancel={() => setPurchaseModalVisible(false)}
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
    gap: 20,
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
  currencyPills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  pillValue: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: -6,
    marginBottom: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  comingSoonCard: {
    opacity: 0.7,
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
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
});

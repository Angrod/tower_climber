import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { gameCopy } from '@/constants/gameCopy';
import { SOLDIER_ROSTER, getSoldierDefinition } from '@/lib/engine/soldierData';
import { getSoldierLevelUpCost } from '@/lib/engine/soldierFormulas';
import { SoldierCard } from '@/components/game/SoldierCard';
import { WallBanner } from '@/components/game/WallBanner';

export default function SoldiersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, isLoaded, soldierWallBannerName, recruitSoldier, levelUpSoldier } =
    useGame();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  const wallSoldierName = soldierWallBannerName
    ? getSoldierDefinition(soldierWallBannerName).name
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WallBanner
        visible={!!wallSoldierName}
        icon="trophy"
        tone="success"
        title={gameCopy.soldierWallTitle}
        subtitle={wallSoldierName ? gameCopy.soldierWallSubLabel(wallSoldierName) : ''}
      />

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
          <Text style={[styles.title, { color: colors.foreground }]}>
            {gameCopy.soldiersTitle}
          </Text>
          <View
            style={[
              styles.goldPill,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <MaterialCommunityIcons name="circle-multiple" size={16} color={colors.primary} />
            <Text style={[styles.goldValue, { color: colors.foreground }]}>
              {state.gold}
            </Text>
          </View>
        </View>

        <View style={styles.list}>
          {SOLDIER_ROSTER.map((definition) => {
            const level = state.soldiers.units[definition.id].level;
            const recruited = level > 0;
            const actionCost = recruited
              ? getSoldierLevelUpCost(definition, level)
              : definition.recruitCost;

            return (
              <SoldierCard
                key={definition.id}
                definition={definition}
                level={level}
                gold={state.gold}
                actionCost={actionCost}
                onPressAction={() =>
                  recruited
                    ? levelUpSoldier(definition.id)
                    : recruitSoldier(definition.id)
                }
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 16,
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
  list: {
    gap: 10,
  },
});

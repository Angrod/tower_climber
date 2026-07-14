import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGame } from '@/context/GameContext';
import { isWallFloor, AUTO_ATTACK_UNLOCK_FLOOR } from '@/lib/engine/formulas';
import { towerClimberSkin } from '@/lib/engine/skins/towerClimber';
import { StatBar } from '@/components/game/StatBar';
import { WallBanner } from '@/components/game/WallBanner';
import { EnemyStage } from '@/components/game/EnemyStage';
import { AutoAttackToggle } from '@/components/game/AutoAttackToggle';

const skin = towerClimberSkin;

export default function ClimbScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, isLoaded, damagePopups, wallBannerVisible, tapAttack, toggleAutoAttack } =
    useGame();

  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  if (!isLoaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WallBanner visible={wallBannerVisible} skin={skin} />

      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + webTopInset + 16,
            paddingBottom: insets.bottom + webBottomInset + 16,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {skin.productName}
          </Text>
          <StatBar
            floor={state.floor}
            attackPower={state.attackPower}
            floorsCleared={state.floorsCleared}
            skin={skin}
          />
        </View>

        <View style={styles.stage}>
          <EnemyStage
            floor={state.floor}
            enemyCurrentHp={state.enemyCurrentHp}
            enemyMaxHp={state.enemyMaxHp}
            isWallFloor={isWallFloor(state.floor)}
            damagePopups={damagePopups}
            onTap={tapAttack}
            skin={skin}
          />
        </View>

        <AutoAttackToggle
          unlocked={state.autoAttackUnlocked}
          active={state.autoAttackActive}
          unlockFloor={AUTO_ATTACK_UNLOCK_FLOOR}
          onToggle={toggleAutoAttack}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    marginBottom: 14,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

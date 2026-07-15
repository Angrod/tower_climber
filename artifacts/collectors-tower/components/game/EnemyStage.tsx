import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';
import type { DamagePopup } from '@/context/GameContext';
import { HeroFigures } from './HeroFigures';
import type { HeroInstance } from '@/lib/engine/types';

interface EnemyStageProps {
  floor: number;
  enemyCurrentHp: number;
  enemyMaxHp: number;
  isWallFloor: boolean;
  damagePopups: DamagePopup[];
  heroInstances: HeroInstance[];
  onTap: () => void;
}

export function EnemyStage({
  floor,
  enemyCurrentHp,
  enemyMaxHp,
  isWallFloor,
  damagePopups,
  heroInstances,
  onTap,
}: EnemyStageProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 60 }),
      withTiming(1, { duration: 120 }),
    );
    onTap();
  };

  const hpRatio = enemyMaxHp > 0 ? Math.max(0, enemyCurrentHp / enemyMaxHp) : 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.floorLabel, { color: colors.mutedForeground }]}>
        {gameCopy.floorLabel(floor)}
      </Text>

      <View style={styles.popupLayer} pointerEvents="none">
        {damagePopups.map((popup, index) => (
          <Animated.View
            key={popup.id}
            exiting={FadeOut.duration(500)}
            style={[styles.popupGroup, { left: 20 + ((index * 13) % 60) }]}
          >
            <Text style={[styles.popup, { color: colors.destructive }]}>
              -{popup.amount}
            </Text>
            {popup.fameAmount > 0 && (
              <Text style={[styles.popupFame, { color: colors.primary }]}>
                +{Math.round(popup.fameAmount)} Fame
              </Text>
            )}
          </Animated.View>
        ))}
      </View>

      <Pressable onPress={handlePress} accessibilityRole="button" testID="enemy-stage">
        <Animated.View
          style={[
            styles.enemyRing,
            bounceStyle,
            {
              backgroundColor: colors.card,
              borderColor: isWallFloor ? colors.destructive : colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="skull"
            size={72}
            color={isWallFloor ? colors.destructive : colors.foreground}
          />
        </Animated.View>
      </Pressable>

      <HeroFigures instances={heroInstances} />

      <Text style={[styles.enemyName, { color: colors.foreground }]}>
        {gameCopy.enemyLabel}
      </Text>

      <View
        style={[styles.hpTrack, { backgroundColor: colors.secondary }]}
        testID="enemy-hp-bar"
      >
        <View
          style={[
            styles.hpFill,
            {
              width: `${hpRatio * 100}%`,
              backgroundColor: isWallFloor ? colors.destructive : colors.primary,
            },
          ]}
        />
      </View>
      <Text style={[styles.hpText, { color: colors.mutedForeground }]}>
        {Math.ceil(enemyCurrentHp)} / {enemyMaxHp} HP
      </Text>

      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        Tap the enemy to attack
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  floorLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  popupLayer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    height: 40,
  },
  popupGroup: {
    position: 'absolute',
    alignItems: 'flex-start',
  },
  popup: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  popupFame: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  enemyRing: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  enemyName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 6,
  },
  hpTrack: {
    width: '100%',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginTop: 8,
  },
  hpFill: {
    height: '100%',
    borderRadius: 7,
  },
  hpText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 10,
  },
});

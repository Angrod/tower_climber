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
import type { DamagePopup } from '@/context/GameContext';
import type { GameSkin } from '@/lib/engine/types';

interface EnemyStageProps {
  floor: number;
  enemyCurrentHp: number;
  enemyMaxHp: number;
  isWallFloor: boolean;
  damagePopups: DamagePopup[];
  onTap: () => void;
  skin: GameSkin;
}

export function EnemyStage({
  floor,
  enemyCurrentHp,
  enemyMaxHp,
  isWallFloor,
  damagePopups,
  onTap,
  skin,
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
        {skin.floorLabel(floor)}
      </Text>

      <View style={styles.popupLayer} pointerEvents="none">
        {damagePopups.map((popup, index) => (
          <Animated.Text
            key={popup.id}
            exiting={FadeOut.duration(500)}
            style={[
              styles.popup,
              { color: colors.destructive, left: 20 + ((index * 13) % 60) },
            ]}
          >
            -{popup.amount}
          </Animated.Text>
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

      <Text style={[styles.enemyName, { color: colors.foreground }]}>
        {skin.enemyLabel}
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
  popup: {
    position: 'absolute',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
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

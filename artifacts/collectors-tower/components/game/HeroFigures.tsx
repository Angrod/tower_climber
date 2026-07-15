import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { HeroInstance } from '@/lib/engine/types';

interface HeroFiguresProps {
  instances: HeroInstance[];
}

/**
 * Small figures rendered next to the enemy for every summoned Hero
 * slot — not just the active/max count in StatBar. A slot that has
 * never been summoned into (never appears in `instances`) renders
 * nothing; a defeated slot stays visible but dimmed (per the "not
 * permanently lost" resummon design), and a summon/resummon/defeat all
 * play a brief pop or shake so the state change reads clearly.
 */
export function HeroFigures({ instances }: HeroFiguresProps) {
  if (instances.length === 0) return null;

  return (
    <View style={styles.row} testID="hero-figures">
      {instances.map((instance) => (
        <HeroFigure key={instance.id} instance={instance} />
      ))}
    </View>
  );
}

function HeroFigure({ instance }: { instance: HeroInstance }) {
  const colors = useColors();
  const scale = useSharedValue(instance.active ? 1 : 0.85);
  const rotate = useSharedValue(0);
  const wasActiveRef = useRef(instance.active);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    if (instance.active && !wasActive) {
      // Resummon/summon — a snappy pop.
      scale.value = withSequence(
        withTiming(1.35, { duration: 90 }),
        withTiming(1, { duration: 140 }),
      );
      rotate.value = 0;
    } else if (!instance.active && wasActive) {
      // Defeated — a quick shake then settle small and dim.
      rotate.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
      scale.value = withSequence(
        withTiming(1.15, { duration: 70 }),
        withTiming(0.85, { duration: 160 }),
      );
    }
    wasActiveRef.current = instance.active;
  }, [instance.active, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
    opacity: instance.active ? 1 : 0.4,
  }));

  const isVariant = instance.isVariant;
  const iconColor = instance.active
    ? isVariant
      ? colors.destructive
      : colors.primary
    : colors.mutedForeground;

  return (
    <Animated.View
      style={[
        styles.figure,
        animatedStyle,
        {
          backgroundColor: colors.card,
          borderColor: isVariant ? colors.destructive : colors.border,
        },
      ]}
      testID={`hero-figure-${instance.id}`}
    >
      <MaterialCommunityIcons
        name={isVariant ? 'fire' : 'sword-cross'}
        size={isVariant ? 20 : 16}
        color={iconColor}
      />
      {!instance.active && (
        <View style={styles.defeatedBadge}>
          <MaterialCommunityIcons name="skull" size={10} color={colors.mutedForeground} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    maxWidth: 220,
  },
  figure: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defeatedBadge: {
    position: 'absolute',
    bottom: -3,
    right: -3,
  },
});

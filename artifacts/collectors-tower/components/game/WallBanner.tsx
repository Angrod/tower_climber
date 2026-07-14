import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';

interface WallBannerProps {
  visible: boolean;
}

export function WallBanner({ visible }: WallBannerProps) {
  const colors = useColors();
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(220)}
      style={[
        styles.banner,
        { backgroundColor: colors.destructive, shadowColor: colors.destructive },
      ]}
    >
      <MaterialCommunityIcons name="shield-alert" size={18} color="#FFFFFF" />
      <Text style={styles.title}>{gameCopy.wallLabel.toUpperCase()}</Text>
      <Text style={styles.subtitle}>{gameCopy.wallSubLabel}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    opacity: 0.9,
    flexShrink: 1,
  },
});

import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';

const AD_DURATION_MS = 3000;
const TICK_MS = 100;

interface RewardedAdModalProps {
  visible: boolean;
  rewardAmount: number;
  onComplete: () => void;
  onClose: () => void;
}

/**
 * Simulated opt-in rewarded-video flow. No live ad network is connected
 * yet, so this plays a timed placeholder instead of a real video, then
 * grants the reward exactly once ad playback finishes. Swap the
 * placeholder body for a real ad SDK's rewarded-ad view once an ad
 * network integration is connected — the opt-in gating (this modal is
 * only ever opened by an explicit "Watch Ad" tap) and the
 * complete-before-reward contract should stay exactly as-is.
 */
export function RewardedAdModal({
  visible,
  rewardAmount,
  onComplete,
  onClose,
}: RewardedAdModalProps) {
  const colors = useColors();
  const [progress, setProgress] = useState(0);
  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      setFinished(false);
      completedRef.current = false;
      return;
    }

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.min(1, elapsed / AD_DURATION_MS);
      setProgress(ratio);
      if (ratio >= 1) {
        clearInterval(interval);
        setFinished(true);
        if (!completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [visible, onComplete]);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons
            name={finished ? 'check-circle' : 'play-circle-outline'}
            size={40}
            color={colors.primary}
          />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {finished
              ? gameCopy.adRewardGrantedLabel(rewardAmount)
              : gameCopy.watchingAdLabel}
          </Text>

          <View style={[styles.track, { backgroundColor: colors.secondary }]}>
            <View
              style={[
                styles.fill,
                { backgroundColor: colors.primary, width: `${progress * 100}%` },
              ]}
            />
          </View>

          {finished && (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.closeButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={[styles.closeText, { color: colors.primaryForeground }]}>OK</Text>
            </Pressable>
          )}
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
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  closeButton: {
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  closeText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});

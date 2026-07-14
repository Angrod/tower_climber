import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { gameCopy } from '@/constants/gameCopy';

interface PurchaseConfirmModalProps {
  visible: boolean;
  priceLabel: string;
  isPurchasing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation UI for the one-time real-money ad-free buyout. Uses a
 * custom modal instead of Alert.alert per RevenueCat guidance (native
 * alerts don't reliably render on every platform this app targets).
 */
export function PurchaseConfirmModal({
  visible,
  priceLabel,
  isPurchasing,
  onConfirm,
  onCancel,
}: PurchaseConfirmModalProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="shield-check-outline" size={36} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {gameCopy.purchaseConfirmTitle}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            {gameCopy.purchaseConfirmBody(priceLabel)}
          </Text>
          <Text style={[styles.note, { color: colors.mutedForeground }]}>
            {gameCopy.purchaseDemoNote}
          </Text>

          <Pressable
            onPress={onConfirm}
            disabled={isPurchasing}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.confirmButton,
              { backgroundColor: colors.primary, opacity: pressed || isPurchasing ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.confirmText, { color: colors.primaryForeground }]}>
              {isPurchasing
                ? gameCopy.watchingAdLabel
                : gameCopy.purchaseConfirmButton(priceLabel)}
            </Text>
          </Pressable>

          <Pressable onPress={onCancel} disabled={isPurchasing} accessibilityRole="button">
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>
              {gameCopy.purchaseCancelButton}
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
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  body: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 19,
  },
  note: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  confirmButton: {
    marginTop: 4,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  cancelText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
});

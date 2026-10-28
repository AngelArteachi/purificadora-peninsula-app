import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { IconButton, PressableScale } from '@/components/ui/PressableScale';
import { ADDRESSES, DELIVERY_WINDOWS } from '@/data/catalog';
import { fonts, makeStyles, radius, spacing, useTheme } from '@/theme';

type DeliverySheetProps = {
  visible: boolean;
  addressId: string;
  windowId: string;
  onClose: () => void;
  onSave: (addressId: string, windowId: string) => void;
};

/** Bottom sheet for changing the saved address and the delivery window. */
export function DeliverySheet(props: DeliverySheetProps) {
  if (!props.visible) return null;
  return <DeliverySheetContent {...props} />;
}

function DeliverySheetContent({ addressId, windowId, onClose, onSave }: DeliverySheetProps) {
  const t = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [draftAddress, setDraftAddress] = useState(addressId);
  const [draftWindow, setDraftWindow] = useState(windowId);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.host}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar selector de entrega"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              Entrega
            </Text>
            <IconButton name="close" size={20} accessibilityLabel="Cerrar" onPress={onClose} />
          </View>

          <Text style={styles.sectionLabel}>Dirección</Text>
          <View style={styles.group}>
            {ADDRESSES.map((address, index) => {
              const selected = address.id === draftAddress;
              return (
                <PressableScale
                  key={address.id}
                  haptic="light"
                  scaleTo={0.99}
                  accessibilityRole="radio"
                  accessibilityLabel={`${address.label}, ${address.line}`}
                  accessibilityState={{ selected }}
                  onPress={() => setDraftAddress(address.id)}
                  style={[styles.option, index > 0 && styles.optionDivider]}
                >
                  <View style={styles.optionIcon}>
                    <Ionicons
                      name={address.id === 'casa' ? 'home-outline' : 'business-outline'}
                      size={18}
                      color={t.textSecondary}
                    />
                  </View>
                  <View style={styles.optionBody}>
                    <Text style={styles.optionTitle}>{address.label}</Text>
                    <Text style={styles.optionLine} numberOfLines={1}>
                      {address.line} · {address.sub}
                    </Text>
                  </View>
                  <Ionicons
                    name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={selected ? t.primary : t.borderStrong}
                  />
                </PressableScale>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Horario</Text>
          <View style={styles.windowRow}>
            {DELIVERY_WINDOWS.map((window) => {
              const selected = window.id === draftWindow;
              return (
                <PressableScale
                  key={window.id}
                  haptic="light"
                  scaleTo={0.97}
                  accessibilityRole="radio"
                  accessibilityLabel={`${window.label}, ${window.sub}`}
                  accessibilityState={{ selected }}
                  onPress={() => setDraftWindow(window.id)}
                  style={[styles.windowOption, selected && styles.windowSelected]}
                >
                  <Text style={[styles.windowLabel, selected && styles.windowLabelSelected]}>{window.label}</Text>
                  <Text style={styles.windowSub}>{window.sub}</Text>
                </PressableScale>
              );
            })}
          </View>

          <Button
            label="Guardar"
            style={styles.save}
            onPress={() => {
              onSave(draftAddress, draftWindow);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((t) => ({
  host: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: t.overlay,
  },
  sheet: {
    paddingHorizontal: spacing.xl,
    paddingTop: 8,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    backgroundColor: t.background,
  },
  handle: {
    alignSelf: 'center',
    height: 5,
    width: 36,
    borderRadius: 3,
    backgroundColor: t.borderStrong,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: t.text,
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 8,
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: t.textSecondary,
  },
  group: {
    backgroundColor: t.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: t.scheme === 'dark' ? 1 : 0,
    borderColor: t.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: t.border,
  },
  optionIcon: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: t.surfaceMuted,
  },
  optionBody: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.text,
  },
  optionLine: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    color: t.textSecondary,
  },
  windowRow: {
    flexDirection: 'row',
    gap: 10,
  },
  windowOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: t.border,
    backgroundColor: t.surface,
  },
  windowSelected: {
    borderColor: t.primary,
    backgroundColor: t.primarySoft,
  },
  windowLabel: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: t.text,
  },
  windowLabelSelected: {
    color: t.primaryText,
  },
  windowSub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: t.textSecondary,
  },
  save: {
    marginTop: 24,
  },
}));

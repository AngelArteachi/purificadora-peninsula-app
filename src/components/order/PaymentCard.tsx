import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/PressableScale';
import { fonts, radius, fill } from '@/theme';

type PaymentCardProps = {
  holder?: string;
  last4?: string;
  expiry?: string;
};

/** Tappable saved card with a 3D flip to show the back. */
export function PaymentCard({ holder = 'MARIANA GÓMEZ', last4 = '4821', expiry = '09/29' }: PaymentCardProps) {
  const [flipped, setFlipped] = useState(false);
  const flip = useSharedValue(0);
  useEffect(() => {
    flip.value = withSpring(flipped ? 180 : 0, { damping: 16, stiffness: 140, mass: 0.9 });
  }, [flip, flipped]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 180], [0, 180])}deg` }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 180], [180, 360])}deg` }],
  }));

  return (
    <View>
      <PressableScale
        haptic="light"
        scaleTo={0.985}
        accessibilityRole="button"
        accessibilityLabel="Tarjeta terminación 4821. Toca para ver el reverso"
        onPress={() => setFlipped((value) => !value)}
        style={styles.host}
      >
        {/* Front */}
        <Animated.View style={[styles.face, frontStyle]}>
          <LinearGradient
            colors={['#1B2733', '#2D3E50', '#3B5068']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.rowBetween}>
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine} />
            </View>
            <View style={styles.brandRow}>
              <Ionicons name="wifi" size={16} color="rgba(255,255,255,0.85)" style={{ transform: [{ rotate: '90deg' }] }} />
              <Text style={styles.brand}>VISA</Text>
            </View>
          </View>

          <View style={styles.numberRow}>
            {['••••', '••••', '••••', last4].map((group, index) => (
              <Text key={index} style={[styles.number, index === 3 && styles.numberLast]}>
                {group}
              </Text>
            ))}
          </View>

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.miniLabel}>TITULAR</Text>
              <Text style={styles.holder}>{holder}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.miniLabel}>VENCE</Text>
              <Text style={styles.holder}>{expiry}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Back */}
        <Animated.View style={[styles.face, styles.back, backStyle]}>
          <LinearGradient
            colors={['#16212C', '#2A3A4B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.stripe} />
          <View style={styles.signatureRow}>
            <View style={styles.signature}>
              <Text style={styles.signatureText}>Mariana Gómez</Text>
            </View>
            <View style={styles.cvv}>
              <Text style={styles.cvvText}>•••</Text>
            </View>
          </View>
          <Text style={styles.backHint}>
            Código de seguridad de 3 dígitos. Toca de nuevo para volver al frente.
          </Text>
          <Text style={styles.backBrand}>HIDRA PAY</Text>
        </Animated.View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    height: 198,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  face: {
    ...fill,
    padding: 20,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
  },
  back: {
    justifyContent: 'flex-start',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chip: {
    width: 42,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'space-evenly',
    paddingHorizontal: 4,
  },
  chipLine: {
    height: 1.4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 1,
    marginHorizontal: 5,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 18,
    letterSpacing: 1.6,
    color: '#FFFFFF',
    fontStyle: 'italic',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  number: {
    fontFamily: fonts.display,
    fontSize: 19,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.92)',
  },
  numberLast: {
    color: '#FFFFFF',
  },
  miniLabel: {
    fontFamily: fonts.semibold,
    fontSize: 10,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.6)',
  },
  holder: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 1.4,
    color: '#FFFFFF',
    marginTop: 2,
  },
  stripe: {
    height: 42,
    backgroundColor: 'rgba(0,0,0,0.55)',
    marginHorizontal: -20,
    marginTop: 6,
  },
  signatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
  },
  signature: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  signatureText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: '#1B2733',
  },
  cvv: {
    height: 38,
    width: 62,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvvText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    letterSpacing: 2,
    color: '#FFFFFF',
  },
  backHint: {
    marginTop: 16,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  backBrand: {
    position: 'absolute',
    right: 20,
    bottom: 18,
    fontFamily: fonts.display,
    fontSize: 12,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.55)',
  },
});

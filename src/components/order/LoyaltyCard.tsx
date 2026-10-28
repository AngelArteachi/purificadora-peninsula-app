import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useMotionActive } from '@/components/motion/useMotionActive';
import { JUG_EMPTY_Y, JUG_FULL_Y, JUG_VIEWBOX_HEIGHT, LoyaltyJug } from '@/components/order/LoyaltyJug';
import { fonts, makeStyles, radius, useTheme, type Palette } from '@/theme';

/** Card backgrounds: a pale water tint in light mode, deep blue in dark mode. */
function cardGradient(t: Palette, rewardReady: boolean) {
  if (t.scheme === 'dark') {
    return rewardReady ? (['#0B4A36', '#11704F'] as const) : (['#0E2B4D', '#14406F'] as const);
  }
  return rewardReady ? (['#D9F5E8', '#F3FCF7'] as const) : (['#D8EAFE', '#F4F9FF'] as const);
}

type LoyaltyCardProps = {
  current: number;
  target: number;
};

/** A twinkling sparkle placed around the jug once the reward is ready. */
function Sparkle({ top, left, size, delay }: { top: number; left: number; size: number; delay: number }) {
  const t = useTheme();
  const active = useMotionActive();
  const twinkle = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      cancelAnimation(twinkle);
      return;
    }
    twinkle.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0.2, { duration: 700 })), -1, false),
    );
  }, [delay, active, twinkle]);
  const style = useAnimatedStyle(() => ({
    opacity: active ? twinkle.value : 1,
    transform: [{ scale: 0.7 + twinkle.value * 0.5 }, { rotate: `${twinkle.value * 45}deg` }],
  }));
  return (
    <Animated.View style={[{ position: 'absolute', top, left }, style]}>
      <Ionicons name="sparkles" size={size} color={t.scheme === 'dark' ? '#FFE08A' : '#E8A400'} />
    </Animated.View>
  );
}

const JUG_HEIGHT = 176;
const MARK_HEIGHT = 14;

/**
 * Measuring scale beside the jug: 1 at the bottom up to the target at the top,
 * each mark at the exact height the water reaches after that many purchases.
 * Reached marks light up one by one as the water climbs past them.
 */
function LevelScale({ target, completed }: { target: number; completed: number }) {
  const styles = useStyles();
  const px = JUG_HEIGHT / JUG_VIEWBOX_HEIGHT;

  return (
    <View style={styles.scale} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: target }).map((_, index) => {
        const mark = index + 1;
        const reached = mark <= completed;
        const current = mark === completed;
        const top = (JUG_EMPTY_Y + (JUG_FULL_Y - JUG_EMPTY_Y) * (mark / target)) * px - MARK_HEIGHT / 2;
        const content = (
          <>
            <View style={[styles.tick, reached && styles.tickReached, current && styles.tickCurrent]} />
            <Text style={[styles.markText, reached && styles.markReached, current && styles.markCurrent]}>
              {mark}
            </Text>
          </>
        );
        return reached ? (
          <Animated.View
            key={mark}
            entering={FadeInLeft.delay(250 + index * 110).springify().damping(14)}
            style={[styles.mark, { top }]}
          >
            {content}
          </Animated.View>
        ) : (
          <View key={mark} style={[styles.mark, { top }]}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

/**
 * Club Hidra reward card, tinted for the system theme, where the garrafón is the hero.
 * Its water rises with every completed purchase until the free one unlocks.
 */
export function LoyaltyCard({ current, target }: LoyaltyCardProps) {
  const t = useTheme();
  const styles = useStyles();
  const safeTarget = Math.max(1, target);
  const completed = Math.max(0, Math.min(current, safeTarget));
  const remaining = safeTarget - completed;
  const rewardReady = completed >= safeTarget;

  // Soft light sweeping across the card, like sun through water.
  const active = useMotionActive();
  const shine = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      cancelAnimation(shine);
      return;
    }
    shine.value = withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [active, shine]);
  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -60 + shine.value * 120 }, { translateY: shine.value * 20 }],
  }));

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={
        rewardReady
          ? 'Club Hidra: tu próximo garrafón es gratis'
          : `Club Hidra: ${completed} de ${safeTarget} compras, te faltan ${remaining} para un garrafón gratis`
      }
    >
      <LinearGradient
        colors={cardGradient(t, rewardReady)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]} />

      <View style={styles.copy}>
        <View style={styles.tag}>
          <Ionicons name={rewardReady ? 'gift' : 'water'} size={12} color={rewardReady ? t.success : t.primaryText} />
          <Text style={[styles.tagText, rewardReady && styles.tagTextReward]}>Club Hidra</Text>
        </View>

        {rewardReady ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <Text style={[styles.bigLabel, styles.bigLabelReward]}>¡Gratis!</Text>
            <Text style={styles.message}>Tu próximo garrafón purificado va por nuestra cuenta.</Text>
          </Animated.View>
        ) : (
          <>
            <View style={styles.countRow}>
              <Text style={styles.count}>{completed}</Text>
              <Text style={styles.countOf}>/{safeTarget}</Text>
            </View>
            <Text style={styles.message}>
              {remaining === 1 ? '¡Una compra más' : `Te faltan ${remaining} compras`} para tu garrafón gratis
              {remaining === 1 ? '!' : ''}
            </Text>
          </>
        )}
      </View>

      <View style={styles.jug}>
        <LoyaltyJug level={completed / safeTarget} height={JUG_HEIGHT} />
        {rewardReady ? (
          <>
            <Sparkle top={6} left={-8} size={16} delay={0} />
            <Sparkle top={44} left={112} size={12} delay={400} />
            <Sparkle top={130} left={-12} size={13} delay={800} />
          </>
        ) : null}
      </View>
      <LevelScale target={safeTarget} completed={completed} />
    </View>
  );
}

const useStyles = makeStyles((t) => {
  const dark = t.scheme === 'dark';
  // Ink on the card: white on deep blue, brand blue / body text on the pale tint.
  const ink = dark ? '#FFFFFF' : t.text;
  const inkSoft = dark ? 'rgba(255,255,255,0.85)' : t.textSecondary;
  const accent = dark ? '#FFFFFF' : t.primaryText;
  const faint = dark ? 'rgba(255,255,255,0.4)' : 'rgba(11,107,211,0.32)';

  return {
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingLeft: 18,
      paddingRight: 10,
      borderRadius: radius['2xl'],
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(11,107,211,0.10)',
      boxShadow: dark ? 'none' : '0px 8px 22px rgba(11,107,211,0.14)',
    },
    shine: {
      position: 'absolute',
      top: -80,
      right: -40,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.7)',
    },
    copy: {
      flex: 1,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)',
    },
    tagText: {
      fontFamily: fonts.bold,
      fontSize: 12,
      color: t.primaryText,
    },
    tagTextReward: {
      color: t.success,
    },
    countRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 8,
    },
    count: {
      fontFamily: fonts.display,
      fontSize: 44,
      lineHeight: 48,
      letterSpacing: -1,
      color: accent,
    },
    countOf: {
      marginLeft: 2,
      fontFamily: fonts.displaySemibold,
      fontSize: 20,
      color: inkSoft,
    },
    bigLabel: {
      marginTop: 8,
      fontFamily: fonts.display,
      fontSize: 36,
      lineHeight: 42,
      color: ink,
    },
    bigLabelReward: {
      color: dark ? '#FFFFFF' : t.success,
    },
    message: {
      marginTop: 2,
      fontFamily: fonts.semibold,
      fontSize: 14,
      lineHeight: 19,
      color: inkSoft,
    },
    jug: {
      width: 132,
      height: JUG_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scale: {
      width: 30,
      height: JUG_HEIGHT,
      // The jug art has empty space right of the glass; tuck the scale against it.
      marginLeft: -20,
    },
    mark: {
      position: 'absolute',
      left: 0,
      height: MARK_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tick: {
      width: 6,
      height: 2,
      borderRadius: 1,
      backgroundColor: faint,
    },
    tickReached: {
      backgroundColor: dark ? 'rgba(255,255,255,0.85)' : t.primary,
    },
    tickCurrent: {
      width: 10,
      backgroundColor: accent,
    },
    markText: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      lineHeight: MARK_HEIGHT,
      color: faint,
      fontVariant: ['tabular-nums'],
    },
    markReached: {
      fontFamily: fonts.bold,
      color: dark ? 'rgba(255,255,255,0.9)' : t.primaryText,
    },
    markCurrent: {
      fontSize: 13,
      color: accent,
    },
  };
});

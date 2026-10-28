import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

/** Delay between consecutive blocks of a screen, in ms. */
export const STAGGER = 45;
/** Blocks past this index enter together, so long screens settle quickly. */
const MAX_STAGGERED = 5;

/**
 * Staggered entrance for a block of content: rises a few pixels and fades in.
 * A stiff spring keeps it short, so a tap during the entrance still lands on
 * the button the user sees. `index` is the block's order on the screen.
 *
 * Note: don't add `withInitialValues` here — on web it leaves the block
 * absolutely positioned with a fixed height, so it stops reflowing when its
 * content grows (an FAQ opening, a coupon row appearing).
 */
export function Reveal({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, MAX_STAGGERED) * STAGGER)
        .springify()
        .damping(22)
        .stiffness(260)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

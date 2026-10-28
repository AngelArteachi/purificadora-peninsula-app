import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { PressableScale } from '@/components/ui/PressableScale';
import { fonts, makeStyles, radius } from '@/theme';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Caption shown under the label, e.g. "Cada martes". */
  sublabels?: Partial<Record<T, string>>;
  style?: StyleProp<ViewStyle>;
};

/** iOS-style segmented control: muted track with a raised surface thumb. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  sublabels,
  style,
}: SegmentedProps<T>) {
  const styles = useStyles();
  const [width, setWidth] = useState(0);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const progress = useSharedValue(index);

  const pad = 3;
  const itemWidth = width ? (width - pad * 2) / options.length : 0;

  // Keep the thumb in sync when the selection changes from the outside.
  useEffect(() => {
    progress.value = withSpring(index, { damping: 20, stiffness: 260, mass: 0.6 });
  }, [index, progress]);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * itemWidth }],
  }));

  return (
    <View style={[styles.track, style]} onLayout={onLayout} accessibilityRole="radiogroup">
      {itemWidth > 0 ? <Animated.View style={[styles.thumb, { width: itemWidth }, thumbStyle]} /> : null}
      {options.map((option) => {
        const active = option.value === value;
        const sublabel = sublabels?.[option.value];
        return (
          <PressableScale
            key={option.value}
            haptic="light"
            scaleTo={0.96}
            accessibilityRole="radio"
            accessibilityLabel={sublabel ? `${option.label}, ${sublabel}` : option.label}
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={styles.item}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
            {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
          </PressableScale>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: {
    flexDirection: 'row',
    backgroundColor: t.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
  },
  thumb: {
    position: 'absolute',
    top: 3,
    left: 3,
    bottom: 3,
    borderRadius: radius.md - 3,
    backgroundColor: t.scheme === 'dark' ? t.surfacePressed : t.surface,
    boxShadow: t.scheme === 'dark' ? 'none' : '0px 1px 3px rgba(16,32,48,0.12)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: t.textSecondary,
  },
  labelActive: {
    fontFamily: fonts.bold,
    color: t.text,
  },
  sublabel: {
    marginTop: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: t.textTertiary,
  },
}));

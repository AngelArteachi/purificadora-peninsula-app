import { Image } from 'expo-image';
import React, { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { GarrafonArt } from '@/components/order/GarrafonArt';
import { Shimmer } from '@/components/ui/Shimmer';
import type { Product } from '@/data/catalog';
import { makeStyles } from '@/theme';

type ProductImageProps = {
  product: Product;
  /** Box height; width follows the container. */
  height: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Product photo in a muted well (with a shimmer until it loads), or the vector
 * garrafón when the product has no photo.
 */
export function ProductImage({ product, height, style }: ProductImageProps) {
  const styles = useStyles();
  const [loaded, setLoaded] = useState(false);
  return (
    <View style={[styles.well, { height }, style]}>
      {product.image ? (
        <Image
          source={product.image}
          contentFit="cover"
          // Bottle shots are portrait; anchoring a bit above center keeps the cap in frame.
          contentPosition={{ top: '15%' }}
          transition={200}
          style={styles.photo}
          accessibilityLabel={product.name}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      ) : (
        <GarrafonArt variant={product.variant} height={height * 0.8} label={null} />
      )}
      {product.image && !loaded ? (
        <Animated.View exiting={FadeOut.duration(250)} style={StyleSheet.absoluteFill}>
          <Shimmer style={StyleSheet.absoluteFill} />
        </Animated.View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  well: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // A faint water tint, so illustrated products sit in the same family as the blue photos.
    backgroundColor: t.scheme === 'dark' ? '#16283A' : '#E7F0FA',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
}));

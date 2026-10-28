import React from 'react';
import type { EdgePadding } from 'react-native-maps';

import { MockMap } from '@/components/map/MockMap';

/** `react-native-maps` has no web support, so web shows the vector stand-in. */
export function TrackingMap(_props: { padding: EdgePadding }) {
  return <MockMap />;
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, type EdgePadding, type MapStyleElement } from 'react-native-maps';

import { Pulse } from '@/components/motion/Pulse';
import { DELIVERY, DELIVERY_ROUTE, type LatLng } from '@/data/catalog';
import { fonts, useTheme } from '@/theme';

/** How far along the route the courier is (matches the "En camino" step). */
const COURIER_PROGRESS = 0.62;

/** Point at a normalized 0–1 distance along a polyline (by segment count). */
function pointAlong(route: LatLng[], progress: number): LatLng {
  const last = route.length - 1;
  const position = Math.min(last, Math.max(0, progress * last));
  const index = Math.min(last - 1, Math.floor(position));
  const u = position - index;
  const from = route[index];
  const to = route[index + 1];
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * u,
    longitude: from.longitude + (to.longitude - from.longitude) * u,
  };
}

/** Google Maps night style for Android; iOS follows `userInterfaceStyle`. */
const DARK_STYLE: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#1d2934' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a9ba9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#17212b' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1b3329' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a3946' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#36495a' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#43596c' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#163049' }] },
];

const LIGHT_STYLE: MapStyleElement[] = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

type TrackingMapProps = {
  /** Space covered by overlays (top card, bottom sheet) so the route stays visible. */
  padding: EdgePadding;
};

/** Real map with the delivery route, the hub, the customer and the courier. */
export function TrackingMap({ padding }: TrackingMapProps) {
  const t = useTheme();
  const map = useRef<MapView>(null);
  const [progress, setProgress] = useState(0);

  const hub = DELIVERY_ROUTE[0];
  const home = DELIVERY_ROUTE[DELIVERY_ROUTE.length - 1];
  const courier = useMemo(() => pointAlong(DELIVERY_ROUTE, progress), [progress]);

  // Ease the courier from the hub to its current position once on mount.
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.min(1, (Date.now() - started) / 2400);
      setProgress(COURIER_PROGRESS * (1 - Math.pow(1 - elapsed, 3)));
      if (elapsed >= 1) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const fitRoute = () => {
    map.current?.fitToCoordinates(DELIVERY_ROUTE, { edgePadding: padding, animated: false });
  };

  return (
    <MapView
      ref={map}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: (hub.latitude + home.latitude) / 2,
        longitude: (hub.longitude + home.longitude) / 2,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }}
      onMapReady={fitRoute}
      mapPadding={padding}
      userInterfaceStyle={t.scheme}
      customMapStyle={t.scheme === 'dark' ? DARK_STYLE : LIGHT_STYLE}
      showsPointsOfInterests={false}
      showsCompass={false}
      toolbarEnabled={false}
      pitchEnabled={false}
    >
      <Polyline coordinates={DELIVERY_ROUTE} strokeColor={t.primary} strokeWidth={5} lineJoin="round" lineCap="round" />

      <Marker coordinate={hub} anchor={{ x: 0.5, y: 0.5 }} title="Hidra" description="Centro de distribución">
        <View style={[styles.hub, { backgroundColor: t.surface, borderColor: t.primary }]} />
      </Marker>

      <Marker coordinate={home} title="Tu dirección" pinColor={t.danger} />

      <Marker coordinate={courier} anchor={{ x: 0.5, y: 0.5 }} title={DELIVERY.courier.name}>
        <Pulse color={t.primary} size={60}>
          <View style={[styles.courier, { backgroundColor: t.text, borderColor: t.surface }]}>
            <Text style={[styles.courierText, { color: t.surface }]}>{DELIVERY.courier.initials}</Text>
          </View>
        </Pulse>
      </Marker>
    </MapView>
  );
}

const styles = StyleSheet.create({
  hub: {
    height: 18,
    width: 18,
    borderRadius: 9,
    borderWidth: 4,
  },
  courier: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  courierText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});

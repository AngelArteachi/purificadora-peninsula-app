import type { GarrafonVariant } from '@/components/order/GarrafonArt';

export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  variant: GarrafonVariant;
  /** Product photo (`require('…')`). Falls back to the vector art when missing. */
  image?: number;
  badge?: string;
};

/** Catalogue sample data. Replace with API data when wiring the backend. */
export const PRODUCTS: Product[] = [
  {
    id: 'purificada-20',
    name: 'Garrafón purificado',
    tagline: '20 L · Osmosis inversa, mineralizada al punto',
    price: 35,
    variant: 'purificada',
    image: require('../../assets/products/purificada.jpg'),
    badge: '2x1 martes',
  },
  {
    id: 'alcalina-20',
    name: 'Garrafón alcalino',
    tagline: '20 L · pH 8.5 con electrolitos añadidos',
    price: 48,
    variant: 'alcalina',
    image: require('../../assets/products/alcalina.jpg'),
  },
  {
    id: 'combo-bomba',
    name: 'Combo con bomba',
    tagline: '19 L + bomba manual de presión',
    price: 129,
    variant: 'bomba',
    badge: 'Ahorra 15%',
  },
  {
    id: 'hielo-5',
    name: 'Hielo purificado',
    tagline: '5 kg · Cubos cristalinos listos para servir',
    price: 42,
    variant: 'hielo',
    image: require('../../assets/products/hielo.jpg'),
  },
];

export const DEFAULT_CART: Record<string, number> = {
  'purificada-20': 2,
  'alcalina-20': 1,
};

export const DELIVERY = {
  address: 'Av. Miguel Ángel de Quevedo 220',
  neighborhood: 'Coyoacán, CDMX',
  window: 'Hoy 6:00 – 8:00 pm',
  fee: 10,
  courier: {
    name: 'Carlos Rendón',
    initials: 'CR',
    rating: 4.9,
    vehicle: 'Moto eléctrica',
    trips: 1284,
  },
  orderId: 'HD-4821',
  etaMinutes: 12,
  distanceKm: 2.4,
};

export type DeliveryAddress = {
  id: string;
  label: string;
  line: string;
  sub: string;
};

export type DeliveryWindow = {
  id: string;
  label: string;
  sub: string;
};

export const ADDRESSES: DeliveryAddress[] = [
  {
    id: 'casa',
    label: 'Casa',
    line: 'Av. Miguel Ángel de Quevedo 220',
    sub: 'Coyoacán, CDMX',
  },
  {
    id: 'oficina',
    label: 'Oficina',
    line: 'Av. Insurgentes Sur 1602',
    sub: 'Crédito Constructor, CDMX',
  },
];

export const DELIVERY_WINDOWS: DeliveryWindow[] = [
  { id: 'today', label: 'Hoy', sub: '6:00 – 8:00 pm' },
  { id: 'tomorrow', label: 'Mañana', sub: '8:00 – 10:00 am' },
];

export type LatLng = { latitude: number; longitude: number };

/**
 * Sample delivery route in Coyoacán, hub → customer. Approximate points along
 * Av. Universidad and Av. Miguel Ángel de Quevedo; a real app would get this
 * polyline from a directions API.
 */
export const DELIVERY_ROUTE: LatLng[] = [
  { latitude: 19.3606, longitude: -99.1712 },
  { latitude: 19.3572, longitude: -99.1716 },
  { latitude: 19.3536, longitude: -99.172 },
  { latitude: 19.35, longitude: -99.1724 },
  { latitude: 19.3468, longitude: -99.1727 },
  { latitude: 19.3462, longitude: -99.1698 },
  { latitude: 19.3456, longitude: -99.1664 },
  { latitude: 19.3451, longitude: -99.1632 },
];

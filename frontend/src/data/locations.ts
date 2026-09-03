export interface LocationNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
  xPct: number;
  yPct: number;
  modes: ('sea' | 'air' | 'road')[];
  type: 'port' | 'airport' | 'multimodal';
  flag: string;
}

export const LOCATIONS: LocationNode[] = [
  // Asia
  { id: 'BOM', name: 'Mumbai', lat: 18.9438, lng: 72.8354, xPct: 62.13, yPct: 54.19, modes: ['sea', 'air'], type: 'multimodal', flag: '🇮🇳' },
  { id: 'SHA', name: 'Shanghai', lat: 31.2304, lng: 121.4737, xPct: 74.59, yPct: 46.52, modes: ['sea', 'air'], type: 'multimodal', flag: '🇨🇳' },
  { id: 'SIN', name: 'Singapore', lat: 1.3521, lng: 103.8198, xPct: 69.82, yPct: 63.58, modes: ['sea', 'air'], type: 'multimodal', flag: '🇸🇬' },
  { id: 'PUS', name: 'Busan', lat: 35.1796, lng: 129.0756, xPct: 76.5, yPct: 44.44, modes: ['sea', 'air'], type: 'multimodal', flag: '🇰🇷' },
  { id: 'TYO', name: 'Tokyo', lat: 35.6762, lng: 139.6503, xPct: 79.4, yPct: 44.07, modes: ['sea', 'air'], type: 'multimodal', flag: '🇯🇵' },
  // Middle East & South Asia
  { id: 'DXB', name: 'Jebel Ali / Dubai', lat: 25.0112, lng: 55.0617, xPct: 57.52, yPct: 50.48, modes: ['sea', 'air'], type: 'multimodal', flag: '🇦🇪' },
  { id: 'CMB', name: 'Colombo', lat: 6.9271, lng: 79.8612, xPct: 63.98, yPct: 60.73, modes: ['sea', 'air'], type: 'multimodal', flag: '🇱🇰' },
  // Africa & Oceania
  { id: 'CPT', name: 'Cape Town', lat: -33.9249, lng: 18.4241, xPct: 48.2, yPct: 84.8, modes: ['sea', 'air'], type: 'multimodal', flag: '🇿🇦' },
  { id: 'SYD', name: 'Sydney', lat: -33.8688, lng: 151.2093, xPct: 82.49, yPct: 83.42, modes: ['sea', 'air'], type: 'multimodal', flag: '🇦🇺' },
  // South America
  { id: 'SSZ', name: 'Santos / Sao Paulo', lat: -23.9618, lng: -46.3322, xPct: 31.45, yPct: 76.45, modes: ['sea', 'air'], type: 'multimodal', flag: '🇧🇷' },
  // Europe
  { id: 'RTM', name: 'Rotterdam', lat: 51.9244, lng: 4.4777, xPct: 44.39, yPct: 33.57, modes: ['sea', 'air', 'road'], type: 'multimodal', flag: '🇳🇱' },
  { id: 'HAM', name: 'Hamburg', lat: 53.5511, lng: 9.9937, xPct: 45.97, yPct: 32.21, modes: ['sea', 'air', 'road'], type: 'multimodal', flag: '🇩🇪' },
  { id: 'LON', name: 'London', lat: 51.5074, lng: -0.1278, xPct: 43.26, yPct: 33.27, modes: ['sea', 'air'], type: 'multimodal', flag: '🇬🇧' },
  { id: 'FRA', name: 'Frankfurt', lat: 50.1109, lng: 8.6821, xPct: 45.61, yPct: 34.9, modes: ['air', 'road'], type: 'multimodal', flag: '🇩🇪' },
  { id: 'IST', name: 'Istanbul', lat: 41.0082, lng: 28.9784, xPct: 50.73, yPct: 40.6, modes: ['sea', 'air'], type: 'multimodal', flag: '🇹🇷' },
  // North America
  { id: 'NYC', name: 'New York', lat: 40.7128, lng: -74.006, xPct: 24.96, yPct: 40.25, modes: ['sea', 'air'], type: 'multimodal', flag: '🇺🇸' },
  { id: 'LAX', name: 'Los Angeles', lat: 34.0522, lng: -118.2437, xPct: 12.43, yPct: 43.98, modes: ['sea', 'air'], type: 'multimodal', flag: '🇺🇸' },
];

export const LOCATIONS_MAP = LOCATIONS.reduce<Record<string, LocationNode>>((acc, loc) => {
  acc[loc.id] = loc;
  return acc;
}, {});

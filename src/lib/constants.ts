export const LISTING_CATEGORIES = [
  'Blades',
  'Rubbers (FH/BH)',
  'Balls',
  'Bags',
  'Shoes',
  'Clothing',
  'Tables & nets',
  'Other',
] as const;

export const LISTING_CONDITIONS = ['New', 'Like new', 'Used', 'For parts'] as const;

export const MAX_DISTANCE_OPTIONS = [
  { value: 0, label: 'Pickup only' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: -1, label: 'Willing to ship anywhere' },
] as const;

export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

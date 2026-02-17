export const SITE_NAME = 'Play.tn';
export const SITE_URL = 'https://play.tn';
export const SITE_DESCRIPTION =
  'Play.tn - Votre boutique en ligne de jeux vidéo, jouets, jeux de société et accessoires gaming en Tunisie.';
export const DEFAULT_CURRENCY = 'TND' as const;
export const DEFAULT_LOCALE = 'fr-TN';
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  stripe: 'Carte bancaire',
  cod: 'Paiement à la livraison',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  customer: 'Client',
  admin: 'Administrateur',
  manager: 'Manager',
  support: 'Support',
  editor: 'Éditeur',
};

export const SHIPPING_ZONES = [
  { id: 'tunis', name: 'Grand Tunis', fee: 7 },
  { id: 'north', name: 'Nord', fee: 9 },
  { id: 'center', name: 'Centre', fee: 10 },
  { id: 'south', name: 'Sud', fee: 12 },
  { id: 'free', name: 'Livraison gratuite (>150 TND)', fee: 0, minOrder: 150 },
];

export const TAX_RATE = 0.19; // TVA 19% Tunisia

export const CATEGORIES_SEED = [
  { slug: 'accessoires-gaming', name: 'Accessoires Gaming', icon: '🎮' },
  { slug: 'jeux-video', name: 'Jeux Vidéo', icon: '🕹️' },
  { slug: 'jouets', name: 'Jouets', icon: '🧸' },
  { slug: 'jeux-de-societe', name: 'Jeux de Société', icon: '🎲' },
  { slug: 'jeux-educatifs', name: 'Jeux Éducatifs', icon: '📚' },
  { slug: 'sport-plein-air', name: 'Sport & Plein Air', icon: '⚽' },
  { slug: 'figurines-collectibles', name: 'Figurines & Collectibles', icon: '🦸' },
  { slug: 'puzzles', name: 'Puzzles', icon: '🧩' },
];

/**
 * Seed script for Play.tn Firestore database.
 *
 * Usage:
 *   npx ts-node scripts/seed-firestore.ts
 *
 * Prerequisites:
 *   - Set FIRESTORE_EMULATOR_HOST=localhost:8080 for local dev
 *   - Or set FIREBASE_SERVICE_ACCOUNT_KEY for production
 */

import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || 'play-tn';
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (serviceAccountPath) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
} else {
  admin.initializeApp({ projectId });
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const categories = [
  {
    id: 'cat_accessoires',
    name: 'Accessoires Gaming',
    slug: 'accessoires-gaming',
    description: 'Manettes, casques, claviers et plus.',
    image: '/categories/accessoires.jpg',
    icon: '🎮',
    order: 1,
    isActive: true,
    productCount: 0,
  },
  {
    id: 'cat_jeux_video',
    name: 'Jeux Vidéo',
    slug: 'jeux-video',
    description: 'Les derniers jeux PS5, Xbox, Switch et PC.',
    image: '/categories/jeux-video.jpg',
    icon: '🕹️',
    order: 2,
    isActive: true,
    productCount: 0,
  },
  {
    id: 'cat_jouets',
    name: 'Jouets',
    slug: 'jouets',
    description: 'Jouets pour enfants de tous âges.',
    image: '/categories/jouets.jpg',
    icon: '🧸',
    order: 3,
    isActive: true,
    productCount: 0,
  },
  {
    id: 'cat_jeux_societe',
    name: 'Jeux de Société',
    slug: 'jeux-de-societe',
    description: 'Monopoly, Catan, Uno et bien plus.',
    image: '/categories/jeux-societe.jpg',
    icon: '🎲',
    order: 4,
    isActive: true,
    productCount: 0,
  },
  {
    id: 'cat_educatifs',
    name: 'Jeux Éducatifs',
    slug: 'jeux-educatifs',
    description: 'Apprendre en s\'amusant.',
    image: '/categories/educatifs.jpg',
    icon: '📚',
    order: 5,
    isActive: true,
    productCount: 0,
  },
  {
    id: 'cat_figurines',
    name: 'Figurines & Collectibles',
    slug: 'figurines-collectibles',
    description: 'Figurines, Funko Pop et objets de collection.',
    image: '/categories/figurines.jpg',
    icon: '🦸',
    order: 6,
    isActive: true,
    productCount: 0,
  },
];

function generateSearchKeywords(name: string, brand?: string): string[] {
  const words = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (brand) {
    words.push(
      brand.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    );
  }

  return [...new Set(words)];
}

const products = [
  {
    id: 'prod_001',
    name: 'Manette PlayStation 5 DualSense',
    slug: 'manette-ps5-dualsense',
    description:
      'Découvrez une expérience de jeu immersive avec la manette DualSense. Retour haptique, gâchettes adaptatives et microphone intégré.',
    shortDescription: 'Manette sans fil PS5 avec retour haptique.',
    price: 189,
    originalPrice: 219,
    currency: 'TND',
    categoryId: 'cat_accessoires',
    categorySlug: 'accessoires-gaming',
    brand: 'Sony',
    sku: 'SONY-DS-WHT-001',
    images: ['/products/dualsense-white.jpg'],
    stock: 25,
    status: 'active',
    featured: true,
    rating: 4.5,
    reviewCount: 32,
    salesCount: 87,
    tags: ['ps5', 'manette', 'sony', 'dualsense'],
    searchKeywords: generateSearchKeywords('Manette PlayStation 5 DualSense', 'Sony'),
  },
  {
    id: 'prod_002',
    name: 'FIFA 25 - PS5',
    slug: 'fifa-25-ps5',
    description:
      'Le jeu de football le plus populaire au monde. Nouveaux modes de jeu, graphismes améliorés et gameplay réaliste.',
    shortDescription: 'FIFA 25 pour PlayStation 5.',
    price: 149,
    originalPrice: null,
    currency: 'TND',
    categoryId: 'cat_jeux_video',
    categorySlug: 'jeux-video',
    brand: 'EA Sports',
    sku: 'EA-FIFA25-PS5',
    images: ['/products/fifa25-ps5.jpg'],
    stock: 50,
    status: 'active',
    featured: true,
    rating: 4.2,
    reviewCount: 18,
    salesCount: 120,
    tags: ['fifa', 'ps5', 'football', 'ea sports'],
    searchKeywords: generateSearchKeywords('FIFA 25 PS5', 'EA Sports'),
  },
  {
    id: 'prod_003',
    name: 'Manette Xbox Series X',
    slug: 'manette-xbox-series-x',
    description:
      'La manette Xbox nouvelle génération. Design ergonomique, bouton Partage et compatibilité Xbox et PC.',
    shortDescription: 'Manette sans fil Xbox Series X.',
    price: 169,
    originalPrice: 189,
    currency: 'TND',
    categoryId: 'cat_accessoires',
    categorySlug: 'accessoires-gaming',
    brand: 'Microsoft',
    sku: 'MS-XBX-CTRL-001',
    images: ['/products/xbox-controller.jpg'],
    stock: 15,
    status: 'active',
    featured: false,
    rating: 4.3,
    reviewCount: 12,
    salesCount: 45,
    tags: ['xbox', 'manette', 'microsoft'],
    searchKeywords: generateSearchKeywords('Manette Xbox Series X', 'Microsoft'),
  },
  {
    id: 'prod_004',
    name: 'Nintendo Switch OLED',
    slug: 'nintendo-switch-oled',
    description:
      'Console Nintendo Switch avec écran OLED 7 pouces. Couleurs vibrantes et son amélioré.',
    shortDescription: 'Console hybride avec écran OLED.',
    price: 899,
    originalPrice: 949,
    currency: 'TND',
    categoryId: 'cat_accessoires',
    categorySlug: 'accessoires-gaming',
    brand: 'Nintendo',
    sku: 'NIN-SW-OLED-001',
    images: ['/products/switch-oled.jpg'],
    stock: 8,
    status: 'active',
    featured: true,
    rating: 4.8,
    reviewCount: 45,
    salesCount: 62,
    tags: ['nintendo', 'switch', 'oled', 'console'],
    searchKeywords: generateSearchKeywords('Nintendo Switch OLED', 'Nintendo'),
  },
  {
    id: 'prod_005',
    name: 'Monopoly Classique',
    slug: 'monopoly-classique',
    description:
      'Le jeu de société le plus vendu au monde. Achetez, négociez et dominez le marché immobilier.',
    shortDescription: 'Jeu de société Monopoly édition classique.',
    price: 79,
    originalPrice: null,
    currency: 'TND',
    categoryId: 'cat_jeux_societe',
    categorySlug: 'jeux-de-societe',
    brand: 'Hasbro',
    sku: 'HAS-MONO-CL-001',
    images: ['/products/monopoly.jpg'],
    stock: 30,
    status: 'active',
    featured: false,
    rating: 4.1,
    reviewCount: 8,
    salesCount: 35,
    tags: ['monopoly', 'hasbro', 'jeu de societe', 'famille'],
    searchKeywords: generateSearchKeywords('Monopoly Classique', 'Hasbro'),
  },
  {
    id: 'prod_006',
    name: 'LEGO Star Wars Millennium Falcon',
    slug: 'lego-star-wars-millennium-falcon',
    description:
      'Construisez le vaisseau légendaire de Han Solo. 1351 pièces, figurines incluses.',
    shortDescription: 'Set LEGO Star Wars avec 1351 pièces.',
    price: 249,
    originalPrice: 289,
    currency: 'TND',
    categoryId: 'cat_jouets',
    categorySlug: 'jouets',
    brand: 'LEGO',
    sku: 'LEGO-SW-MF-001',
    images: ['/products/lego-falcon.jpg'],
    stock: 12,
    status: 'active',
    featured: true,
    rating: 4.9,
    reviewCount: 22,
    salesCount: 28,
    tags: ['lego', 'star wars', 'construction', 'jouet'],
    searchKeywords: generateSearchKeywords('LEGO Star Wars Millennium Falcon', 'LEGO'),
  },
  {
    id: 'prod_007',
    name: 'Casque Gaming HyperX Cloud III',
    slug: 'casque-gaming-hyperx-cloud-iii',
    description:
      'Casque gaming premium avec son surround 7.1, microphone amovible et coussinets en mousse à mémoire de forme.',
    shortDescription: 'Casque gaming HyperX avec son 7.1.',
    price: 229,
    originalPrice: null,
    currency: 'TND',
    categoryId: 'cat_accessoires',
    categorySlug: 'accessoires-gaming',
    brand: 'HyperX',
    sku: 'HX-CLOUD3-001',
    images: ['/products/hyperx-cloud3.jpg'],
    stock: 20,
    status: 'active',
    featured: false,
    rating: 4.6,
    reviewCount: 15,
    salesCount: 40,
    tags: ['hyperx', 'casque', 'gaming', 'audio'],
    searchKeywords: generateSearchKeywords('Casque Gaming HyperX Cloud III', 'HyperX'),
  },
  {
    id: 'prod_008',
    name: 'Funko Pop Spider-Man',
    slug: 'funko-pop-spider-man',
    description:
      'Figurine Funko Pop! Spider-Man en vinyle. Hauteur : 10 cm. Collection Marvel.',
    shortDescription: 'Figurine Funko Pop Spider-Man Marvel.',
    price: 45,
    originalPrice: null,
    currency: 'TND',
    categoryId: 'cat_figurines',
    categorySlug: 'figurines-collectibles',
    brand: 'Funko',
    sku: 'FNK-SPD-001',
    images: ['/products/funko-spiderman.jpg'],
    stock: 40,
    status: 'active',
    featured: false,
    rating: 4.4,
    reviewCount: 10,
    salesCount: 55,
    tags: ['funko', 'pop', 'spider-man', 'marvel', 'figurine'],
    searchKeywords: generateSearchKeywords('Funko Pop Spider-Man', 'Funko'),
  },
];

const coupons = [
  {
    id: 'coupon_welcome',
    code: 'BIENVENUE10',
    description: '10% de réduction pour les nouveaux clients.',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 50,
    maximumDiscount: 30,
    usageLimit: 1000,
    usedCount: 0,
    perUserLimit: 1,
    applicableCategories: [],
    applicableProducts: [],
    isActive: true,
    startsAt: new Date('2025-01-01'),
    expiresAt: new Date('2026-12-31'),
  },
  {
    id: 'coupon_summer',
    code: 'ETE2025',
    description: '15 TND de réduction pour les commandes de plus de 100 TND.',
    discountType: 'fixed',
    discountValue: 15,
    minimumOrder: 100,
    maximumDiscount: null,
    usageLimit: 500,
    usedCount: 0,
    perUserLimit: 2,
    applicableCategories: [],
    applicableProducts: [],
    isActive: true,
    startsAt: new Date('2025-06-01'),
    expiresAt: new Date('2025-09-30'),
  },
];

const settings = {
  storeName: 'Play.tn',
  storeDescription:
    'Votre boutique en ligne de jeux vidéo, jouets, jeux de société et accessoires gaming en Tunisie.',
  storeEmail: 'contact@play.tn',
  storePhone: '+216 XX XXX XXX',
  currency: 'TND',
  locale: 'fr-TN',
  taxRate: 0.19,
  freeShippingThreshold: 150,
  shippingZones: [
    { id: 'tunis', name: 'Grand Tunis', fee: 7 },
    { id: 'north', name: 'Nord', fee: 9 },
    { id: 'center', name: 'Centre', fee: 10 },
    { id: 'south', name: 'Sud', fee: 12 },
  ],
  socialLinks: {
    facebook: 'https://facebook.com/play.tn',
    instagram: 'https://instagram.com/play.tn',
    twitter: '',
    tiktok: '',
  },
  paymentMethods: {
    cashOnDelivery: true,
    card: false,
    flouci: false,
  },
  orderNotifications: {
    emailOnNewOrder: true,
    emailOnStatusChange: true,
  },
  maintenance: {
    enabled: false,
    message: '',
  },
};

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log('🌱 Seeding Play.tn Firestore database...\n');

  // Categories
  console.log('📁 Seeding categories...');
  for (const cat of categories) {
    const { id, ...data } = cat;
    await db
      .collection('categories')
      .doc(id)
      .set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    console.log(`   ✓ ${data.name}`);
  }

  // Products
  console.log('\n📦 Seeding products...');
  for (const prod of products) {
    const { id, ...data } = prod;
    await db
      .collection('products')
      .doc(id)
      .set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    console.log(`   ✓ ${data.name} (${data.price} TND)`);
  }

  // Update category product counts
  console.log('\n🔢 Updating category product counts...');
  for (const cat of categories) {
    const count = products.filter((p) => p.categoryId === cat.id).length;
    await db.collection('categories').doc(cat.id).update({ productCount: count });
    console.log(`   ✓ ${cat.name}: ${count} produits`);
  }

  // Coupons
  console.log('\n🎟️  Seeding coupons...');
  for (const coupon of coupons) {
    const { id, ...data } = coupon;
    await db
      .collection('coupons')
      .doc(id)
      .set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    console.log(`   ✓ ${data.code} (${data.description})`);
  }

  // Settings
  console.log('\n⚙️  Seeding store settings...');
  await db
    .collection('settings')
    .doc('store_config')
    .set({
      ...settings,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  console.log('   ✓ Store configuration saved');

  console.log('\n✅ Seeding complete!\n');
  console.log(`   ${categories.length} categories`);
  console.log(`   ${products.length} products`);
  console.log(`   ${coupons.length} coupons`);
  console.log(`   1 store config\n`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

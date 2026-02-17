import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  Gamepad2,
  Disc3,
  Baby,
  Puzzle,
  GraduationCap,
  Bike,
  Trophy,
  Dices,
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
} from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Play.tn | Jeux, Jouets & Gaming en Tunisie',
  description:
    'Découvrez la plus grande sélection de jeux, jouets et accessoires gaming en Tunisie. Livraison rapide, paiement sécurisé et les meilleurs prix garantis.',
};

const categories = [
  {
    name: 'Accessoires Gaming',
    slug: 'accessoires-gaming',
    icon: Gamepad2,
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    image: '/categories/gaming.jpg',
  },
  {
    name: 'Jeux Vidéo',
    slug: 'jeux-video',
    icon: Disc3,
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    image: '/categories/video-games.jpg',
  },
  {
    name: 'Jouets',
    slug: 'jouets',
    icon: Baby,
    color: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
    image: '/categories/toys.jpg',
  },
  {
    name: 'Jeux de Société',
    slug: 'jeux-de-societe',
    icon: Dices,
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    image: '/categories/board-games.jpg',
  },
  {
    name: 'Jeux Éducatifs',
    slug: 'jeux-educatifs',
    icon: GraduationCap,
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
    image: '/categories/educational.jpg',
  },
  {
    name: 'Sport & Plein Air',
    slug: 'sport-plein-air',
    icon: Bike,
    color: 'bg-teal-50 text-teal-600 hover:bg-teal-100',
    image: '/categories/sports.jpg',
  },
  {
    name: 'Figurines & Collectibles',
    slug: 'figurines-collectibles',
    icon: Trophy,
    color: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    image: '/categories/figurines.jpg',
  },
  {
    name: 'Puzzles',
    slug: 'puzzles',
    icon: Puzzle,
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    image: '/categories/puzzles.jpg',
  },
];

const featuredProducts = [
  {
    id: '1',
    name: 'Manette PS5 DualSense',
    slug: 'manette-ps5-dualsense',
    price: 189.9,
    originalPrice: 229.9,
    image: '/products/dualsense.jpg',
    rating: 4.8,
    reviewCount: 124,
    badge: 'Promo' as const,
    category: 'Accessoires Gaming',
  },
  {
    id: '2',
    name: 'Monopoly Tunisie Edition',
    slug: 'monopoly-tunisie-edition',
    price: 79.9,
    image: '/products/monopoly.jpg',
    rating: 4.6,
    reviewCount: 89,
    badge: 'Nouveau' as const,
    category: 'Jeux de Société',
  },
  {
    id: '3',
    name: 'LEGO Technic Voiture de Course',
    slug: 'lego-technic-voiture-course',
    price: 149.9,
    image: '/products/lego-technic.jpg',
    rating: 4.9,
    reviewCount: 56,
    category: 'Jouets',
  },
  {
    id: '4',
    name: 'Casque Gaming HyperX Cloud III',
    slug: 'casque-hyperx-cloud-iii',
    price: 259.9,
    originalPrice: 299.9,
    image: '/products/hyperx.jpg',
    rating: 4.7,
    reviewCount: 203,
    badge: 'Promo' as const,
    category: 'Accessoires Gaming',
  },
  {
    id: '5',
    name: 'Puzzle Ravensburger 1000 pcs',
    slug: 'puzzle-ravensburger-1000',
    price: 49.9,
    image: '/products/puzzle.jpg',
    rating: 4.5,
    reviewCount: 42,
    category: 'Puzzles',
  },
  {
    id: '6',
    name: 'Figurine Dragon Ball Z Goku',
    slug: 'figurine-dbz-goku',
    price: 119.9,
    image: '/products/goku.jpg',
    rating: 4.9,
    reviewCount: 167,
    badge: 'Populaire' as const,
    category: 'Figurines & Collectibles',
  },
  {
    id: '7',
    name: 'Kit Scientifique Chimie',
    slug: 'kit-scientifique-chimie',
    price: 64.9,
    image: '/products/science-kit.jpg',
    rating: 4.4,
    reviewCount: 31,
    badge: 'Nouveau' as const,
    category: 'Jeux Éducatifs',
  },
  {
    id: '8',
    name: 'Trottinette Freestyle Pro',
    slug: 'trottinette-freestyle-pro',
    price: 199.9,
    originalPrice: 249.9,
    image: '/products/scooter.jpg',
    rating: 4.6,
    reviewCount: 78,
    badge: 'Promo' as const,
    category: 'Sport & Plein Air',
  },
];

const trustFeatures = [
  {
    icon: Truck,
    title: 'Livraison Rapide',
    description: 'Partout en Tunisie sous 24-48h',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement Sécurisé',
    description: 'Carte bancaire, virement ou à la livraison',
  },
  {
    icon: RefreshCw,
    title: 'Retour Gratuit',
    description: 'Retour sous 14 jours sans frais',
  },
  {
    icon: Headphones,
    title: 'Support Client',
    description: 'Assistance 7j/7 par chat et téléphone',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 -top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
        </div>
        <div className="container-page relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="text-center lg:text-left">
              <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                Bienvenue chez Play.tn
              </span>
              <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Le monde du{' '}
                <span className="text-secondary-300">jeu</span> a
                portee de main
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-blue-100 sm:text-xl">
                Decouvrez la plus grande selection de jeux, jouets et
                accessoires gaming en Tunisie. Qualite premium, prix
                imbattables et livraison rapide.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/produits">
                  <Button variant="secondary" size="lg">
                    Decouvrez nos produits
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/produits?promo=true">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                    Voir les promotions
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative mx-auto aspect-square w-full max-w-lg">
                <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-sm" />
                <Image
                  src="/hero-image.png"
                  alt="Jeux et jouets - Play.tn"
                  fill
                  className="rounded-3xl object-contain p-8"
                  priority
                  sizes="(max-width: 1024px) 0vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-gray-100 bg-gray-50 py-8">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {trustFeatures.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
              Nos Categories
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-500">
              Explorez notre large gamme de produits pour tous les ages et tous
              les gouts
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/produits?categorie=${category.slug}`}
                className={`group flex flex-col items-center gap-3 rounded-2xl p-6 text-center transition-all duration-300 ${category.color}`}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <category.icon className="h-8 w-8" />
                </div>
                <span className="text-sm font-semibold">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="mb-3 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
                Produits Populaires
              </h2>
              <p className="text-lg text-gray-500">
                Les produits les plus aimes par nos clients
              </p>
            </div>
            <Link
              href="/produits"
              className="hidden items-center gap-2 font-semibold text-primary transition-colors hover:text-primary-700 sm:flex"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/produits">
              <Button variant="outline">
                Voir tous les produits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-secondary-500 to-secondary-600 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-yellow-300 blur-3xl" />
        </div>
        <div className="container-page relative text-center">
          <span className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white">
            Offre Speciale
          </span>
          <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Jusqu&apos;a -40% sur le Gaming
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-orange-100">
            Profitez de nos promotions exceptionnelles sur une selection
            d&apos;accessoires gaming, casques, manettes et plus encore.
          </p>
          <Link href="/produits?promo=true">
            <Button variant="primary" size="lg" className="bg-white text-secondary hover:bg-gray-100">
              Voir les promotions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-2xl rounded-3xl bg-primary-50 p-8 text-center sm:p-12">
            <h2 className="mb-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              Restez informe
            </h2>
            <p className="mb-6 text-gray-600">
              Inscrivez-vous a notre newsletter pour recevoir nos offres
              exclusives et les dernieres nouveautes.
            </p>
            <form className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="input-field flex-1"
                required
                aria-label="Adresse email pour la newsletter"
              />
              <Button type="submit" variant="primary">
                S&apos;inscrire
              </Button>
            </form>
            <p className="mt-4 text-xs text-gray-400">
              En vous inscrivant, vous acceptez notre politique de
              confidentialite. Desabonnement possible a tout moment.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

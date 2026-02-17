import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import ProductGallery from '@/components/product/ProductGallery';
import ProductCard from '@/components/product/ProductCard';
import StructuredData from '@/components/seo/StructuredData';
import ProductActions from './ProductActions';

interface ProductPageProps {
  params: { slug: string };
}

// Mock product data - in production this would come from an API
async function getProduct(slug: string) {
  const product = {
    id: '1',
    slug,
    name: 'Manette PS5 DualSense',
    description:
      'La manette DualSense repousse les limites du jeu. Decouvrez une experience de jeu plus profonde et immersive avec la nouvelle manette PS5 innovante. Le retour haptique et les gachettes adaptatives vous plongent au coeur de l\'action comme jamais auparavant.',
    longDescription:
      'La manette sans fil DualSense pour PS5 offre un retour haptique immersif, des gachettes adaptatives dynamiques et un micro integre, le tout dans un design emblematique et confortable. Le retour haptique donne la sensation de differentes surfaces et effets meteorologiques au creux de vos mains, tandis que les gachettes adaptatives simulent la tension physique de vos activites en jeu.',
    price: 189.9,
    originalPrice: 229.9,
    currency: 'TND',
    images: [
      '/products/dualsense-1.jpg',
      '/products/dualsense-2.jpg',
      '/products/dualsense-3.jpg',
      '/products/dualsense-4.jpg',
    ],
    category: { name: 'Accessoires Gaming', slug: 'accessoires-gaming' },
    brand: 'Sony',
    rating: 4.8,
    reviewCount: 124,
    inStock: true,
    sku: 'SONY-DS-001',
    variants: [
      { name: 'Blanc', value: 'blanc', inStock: true },
      { name: 'Noir Minuit', value: 'noir', inStock: true },
      { name: 'Rouge Cosmique', value: 'rouge', inStock: false },
      { name: 'Bleu Stellaire', value: 'bleu', inStock: true },
    ],
    features: [
      'Retour haptique immersif',
      'Gachettes adaptatives dynamiques',
      'Microphone integre',
      'Bouton Create',
      'Batterie rechargeable integree',
      'Connexion Bluetooth et USB-C',
    ],
    specifications: {
      'Poids': '280g',
      'Dimensions': '160 x 66 x 106 mm',
      'Connectivite': 'Bluetooth 5.1, USB-C',
      'Autonomie': 'Jusqu\'a 12 heures',
      'Compatibilite': 'PS5, PC',
    },
    reviews: [
      {
        id: '1',
        author: 'Ahmed B.',
        rating: 5,
        date: '2024-12-15',
        title: 'Excellente manette !',
        content:
          'La meilleure manette que j\'ai jamais eue. Le retour haptique est incroyable et les gachettes adaptatives changent completement l\'experience de jeu.',
      },
      {
        id: '2',
        author: 'Sana M.',
        rating: 4,
        date: '2024-11-28',
        title: 'Tres bonne qualite',
        content:
          'Tres satisfaite de mon achat. La prise en main est confortable et les fonctionnalites sont top. Seul bemol : l\'autonomie pourrait etre meilleure.',
      },
      {
        id: '3',
        author: 'Youssef K.',
        rating: 5,
        date: '2024-11-10',
        title: 'Un must-have pour PS5',
        content:
          'Impossible de jouer sur PS5 sans cette manette. La qualite de fabrication est irreprochable. Livraison rapide par Play.tn !',
      },
    ],
  };
  return product;
}

async function getRelatedProducts() {
  return [
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
      id: '10',
      name: 'Clavier Mecanique RGB',
      slug: 'clavier-mecanique-rgb',
      price: 179.9,
      originalPrice: 219.9,
      image: '/products/keyboard.jpg',
      rating: 4.5,
      reviewCount: 95,
      badge: 'Promo' as const,
      category: 'Accessoires Gaming',
    },
    {
      id: '9',
      name: 'Nintendo Switch OLED',
      slug: 'nintendo-switch-oled',
      price: 899.9,
      image: '/products/switch-oled.jpg',
      rating: 4.9,
      reviewCount: 312,
      badge: 'Populaire' as const,
      category: 'Jeux Vidéo',
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
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);

  return {
    title: `${product.name} - ${product.category.name}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Play.tn`,
      description: product.description,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.slug);
  const relatedProducts = await getRelatedProducts();

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `https://play.tn${img}`),
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: `https://play.tn/produits/${product.slug}`,
      priceCurrency: product.currency,
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Play.tn',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    review: product.reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
      },
      reviewBody: review.content,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://play.tn',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Produits',
        item: 'https://play.tn/produits',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category.name,
        item: `https://play.tn/produits?categorie=${product.category.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: `https://play.tn/produits/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <StructuredData data={productSchema} />
      <StructuredData data={breadcrumbSchema} />

      {/* Breadcrumbs */}
      <nav className="border-b border-gray-100 bg-gray-50">
        <div className="container-page py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="flex items-center hover:text-primary">
                <Home className="h-4 w-4" />
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li>
              <Link href="/produits" className="hover:text-primary">
                Produits
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li>
              <Link
                href={`/produits?categorie=${product.category.slug}`}
                className="hover:text-primary"
              >
                {product.category.name}
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="truncate font-medium text-gray-900">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="container-page py-8">
        {/* Product Main Section */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <div>
            <div className="mb-2 text-sm font-medium text-primary">
              {product.brand}
            </div>
            <h1 className="mb-3 font-display text-2xl font-bold text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(product.rating)
                        ? 'text-yellow-400'
                        : 'text-gray-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {product.rating} ({product.reviewCount} avis)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {product.price.toFixed(2)} TND
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    {product.originalPrice.toFixed(2)} TND
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    -
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    %
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="mb-6 leading-relaxed text-gray-600">
              {product.description}
            </p>

            {/* Availability */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                  En stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Rupture de stock
                </span>
              )}
            </div>

            {/* Client-side interactive actions */}
            <ProductActions
              productId={product.id}
              productName={product.name}
              price={product.price}
              variants={product.variants}
              inStock={product.inStock}
            />

            {/* Features */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Caracteristiques
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-accent"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-900">
                Specifications
              </h3>
              <dl className="space-y-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-gray-500">{key}</dt>
                    <dd className="font-medium text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <section className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-gray-900">
            Description detaillee
          </h2>
          <div className="prose max-w-none text-gray-600">
            <p>{product.longDescription}</p>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mt-12 border-t border-gray-100 pt-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-gray-900">
              Avis clients ({product.reviewCount})
            </h2>
          </div>

          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-gray-100 p-6"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {review.author}
                    </span>
                    <span className="ml-3 text-sm text-gray-400">
                      {new Date(review.date).toLocaleDateString('fr-TN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  {review.title}
                </h4>
                <p className="text-sm leading-relaxed text-gray-600">
                  {review.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        <section className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="mb-6 font-display text-xl font-bold text-gray-900">
            Produits similaires
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

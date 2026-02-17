import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home, Calendar, Eye, ArrowLeft } from 'lucide-react';
import StructuredData from '@/components/seo/StructuredData';

interface BlogPostPageProps {
  params: { slug: string };
}

// Mock - in production this would call the API
async function getPost(slug: string) {
  return {
    id: '1',
    title: 'Guide d\'achat : Les meilleures manettes PS5 en 2025',
    slug,
    content: `
      <h2>Introduction</h2>
      <p>La manette est l'un des accessoires les plus importants pour tout joueur PS5. Que vous soyez un gamer casual ou un joueur competitif, le choix de votre manette peut transformer votre experience de jeu.</p>

      <h2>1. Sony DualSense - Le choix de reference</h2>
      <p>La DualSense est la manette officielle de Sony pour la PS5. Elle offre un retour haptique revolutionnaire et des gachettes adaptatives qui vous plongent au coeur de l'action. Disponible en plusieurs coloris, elle reste le choix numero un pour la plupart des joueurs.</p>

      <h3>Points forts</h3>
      <ul>
        <li>Retour haptique immersif</li>
        <li>Gachettes adaptatives</li>
        <li>Microphone integre</li>
        <li>Design ergonomique</li>
      </ul>

      <h2>2. DualSense Edge - Pour les competiteurs</h2>
      <p>La DualSense Edge est la version pro de la manette PS5. Elle offre des sticks interchangeables, des boutons arriere programmables et des profiles de jeu personnalisables. Ideale pour les joueurs competitifs.</p>

      <h2>3. Alternatives tierces</h2>
      <p>Plusieurs marques proposent des alternatives interessantes comme Nacon, Razer ou HyperX. Ces manettes offrent souvent des fonctionnalites additionnelles a des prix competitifs.</p>

      <h2>Conclusion</h2>
      <p>Le choix de votre manette depend de votre budget et de vos besoins. Pour la plupart des joueurs, la DualSense standard reste le meilleur rapport qualite-prix. Les joueurs competitifs devraient considerer la DualSense Edge.</p>

      <p>Retrouvez toutes ces manettes sur <strong>Play.tn</strong> avec livraison rapide partout en Tunisie !</p>
    `,
    excerpt:
      'Decouvrez notre selection des meilleures manettes pour PlayStation 5.',
    coverImage: '/blog/manettes-ps5.jpg',
    category: 'Guides',
    tags: ['PS5', 'Manettes', 'Gaming', 'Guide'],
    authorName: 'Equipe Play.tn',
    publishedAt: '2025-01-15T10:00:00Z',
    seoTitle: 'Guide d\'achat : Les meilleures manettes PS5 en 2025 | Play.tn',
    seoDescription:
      'Comparatif des meilleures manettes PS5 en 2025. DualSense, DualSense Edge et alternatives. Guide complet pour bien choisir.',
    viewCount: 1250,
  };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPost(params.slug);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    author: {
      '@type': 'Organization',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Play.tn',
      logo: {
        '@type': 'ImageObject',
        url: 'https://play.tn/logo.png',
      },
    },
    datePublished: post.publishedAt,
    image: post.coverImage ? `https://play.tn${post.coverImage}` : undefined,
    mainEntityOfPage: `https://play.tn/blog/${post.slug}`,
  };

  return (
    <>
      <StructuredData data={articleSchema} />

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
              <Link href="/blog" className="hover:text-primary">
                Blog
              </Link>
            </li>
            <ChevronRight className="h-3 w-3" />
            <li className="truncate font-medium text-gray-900">
              {post.title}
            </li>
          </ol>
        </div>
      </nav>

      <article className="container-page py-12">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>

          {/* Category Badge */}
          <span className="mb-4 inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="mb-4 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="mb-8 flex items-center gap-4 text-sm text-gray-400">
            <span>Par {post.authorName}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount} vues
            </span>
          </div>

          {/* Cover Image Placeholder */}
          <div className="mb-10 aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm text-gray-400">
                Image de couverture
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-strong:text-gray-900 prose-ul:text-gray-600 prose-li:text-gray-600"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 border-t border-gray-100 pt-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-primary-50 p-8 text-center">
            <h2 className="mb-3 font-display text-xl font-bold text-gray-900">
              Decouvrez nos produits
            </h2>
            <p className="mb-6 text-gray-600">
              Retrouvez les meilleurs jeux, jouets et accessoires gaming sur Play.tn
            </p>
            <Link
              href="/produits"
              className="btn-primary inline-flex items-center"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}

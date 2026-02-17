import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home, Calendar, Eye, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog - Actualites Gaming & Jouets',
  description:
    'Retrouvez nos articles, guides d\'achat et actualites sur le gaming, les jouets et les jeux de societe en Tunisie.',
};

// Mock data - in production fetched from /api/blog
const blogPosts = [
  {
    id: '1',
    title: 'Guide d\'achat : Les meilleures manettes PS5 en 2025',
    slug: 'guide-achat-meilleures-manettes-ps5-2025',
    excerpt:
      'Decouvrez notre selection des meilleures manettes pour PlayStation 5, avec des comparatifs detailles et nos recommandations pour chaque budget.',
    coverImage: '/blog/manettes-ps5.jpg',
    category: 'Guides',
    authorName: 'Equipe Play.tn',
    publishedAt: '2025-01-15T10:00:00Z',
    viewCount: 1250,
  },
  {
    id: '2',
    title: 'Top 10 des jeux de societe pour les soirees en famille',
    slug: 'top-10-jeux-societe-soirees-famille',
    excerpt:
      'Rien de mieux qu\'un bon jeu de societe pour passer une soiree en famille. Voici notre selection des 10 meilleurs jeux pour petits et grands.',
    coverImage: '/blog/jeux-societe.jpg',
    category: 'Selection',
    authorName: 'Equipe Play.tn',
    publishedAt: '2025-01-10T10:00:00Z',
    viewCount: 890,
  },
  {
    id: '3',
    title: 'Comment choisir le bon jouet educatif selon l\'age de votre enfant',
    slug: 'choisir-jouet-educatif-selon-age',
    excerpt:
      'Les jouets educatifs sont essentiels au developpement de l\'enfant. Apprenez a choisir le jouet adapte a chaque tranche d\'age.',
    coverImage: '/blog/jouets-educatifs.jpg',
    category: 'Conseils',
    authorName: 'Equipe Play.tn',
    publishedAt: '2025-01-05T10:00:00Z',
    viewCount: 640,
  },
  {
    id: '4',
    title: 'Les nouveautes LEGO 2025 : ce qu\'il faut retenir',
    slug: 'nouveautes-lego-2025',
    excerpt:
      'LEGO devoile ses nouvelles gammes pour 2025. Decouvrez les sets les plus attendus et nos coups de coeur de la nouvelle collection.',
    coverImage: '/blog/lego-2025.jpg',
    category: 'Actualites',
    authorName: 'Equipe Play.tn',
    publishedAt: '2024-12-28T10:00:00Z',
    viewCount: 1100,
  },
  {
    id: '5',
    title: 'Gaming en Tunisie : l\'essor de la communaute e-sport',
    slug: 'gaming-tunisie-essor-communaute-esport',
    excerpt:
      'Le gaming competitif connait un essor sans precedent en Tunisie. Tour d\'horizon de la scene e-sport tunisienne et de ses acteurs cles.',
    coverImage: '/blog/esport-tunisie.jpg',
    category: 'Actualites',
    authorName: 'Equipe Play.tn',
    publishedAt: '2024-12-20T10:00:00Z',
    viewCount: 2300,
  },
  {
    id: '6',
    title: '5 puzzles pour debutants et experts',
    slug: '5-puzzles-debutants-experts',
    excerpt:
      'Le puzzle est un excellent passe-temps qui stimule la concentration et la patience. Voici nos recommandations pour tous les niveaux.',
    coverImage: '/blog/puzzles.jpg',
    category: 'Selection',
    authorName: 'Equipe Play.tn',
    publishedAt: '2024-12-15T10:00:00Z',
    viewCount: 430,
  },
];

const blogCategories = [
  { name: 'Tous', slug: '' },
  { name: 'Guides', slug: 'guides' },
  { name: 'Actualites', slug: 'actualites' },
  { name: 'Selection', slug: 'selection' },
  { name: 'Conseils', slug: 'conseils' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
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
            <li className="font-medium text-gray-900">Blog</li>
          </ol>
        </div>
      </nav>

      <div className="container-page py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-3 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Blog Play.tn
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Guides d&apos;achat, actualites gaming et conseils jouets pour petits et grands.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {blogCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.slug ? `/blog?categorie=${cat.slug}` : '/blog'}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:bg-primary-50 hover:text-primary"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="card group flex flex-col overflow-hidden"
            >
              {/* Cover Image Placeholder */}
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <span className="text-xs text-gray-400">{post.title}</span>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                  {post.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                {/* Meta */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.viewCount} vues
                  </span>
                </div>

                {/* Title */}
                <h2 className="mb-2 line-clamp-2 font-display text-lg font-bold text-gray-900 transition-colors group-hover:text-primary">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>

                {/* Excerpt */}
                <p className="mb-4 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-500">
                  {post.excerpt}
                </p>

                {/* Read More */}
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-700"
                >
                  Lire la suite
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

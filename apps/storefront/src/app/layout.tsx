import type { Metadata } from 'next';
import { Inter, Fredoka } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StructuredData from '@/components/seo/StructuredData';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://play.tn'),
  title: {
    default: 'Play.tn | Jeux, Jouets & Gaming en Tunisie',
    template: '%s | Play.tn',
  },
  description:
    'Votre boutique en ligne de jeux, jouets et accessoires gaming en Tunisie. Livraison rapide partout en Tunisie. Les meilleures marques aux meilleurs prix.',
  keywords: [
    'jeux',
    'jouets',
    'gaming',
    'Tunisie',
    'accessoires gaming',
    'jeux vidéo',
    'jeux de société',
    'jeux éducatifs',
    'figurines',
    'puzzles',
    'boutique en ligne',
    'play.tn',
  ],
  authors: [{ name: 'Play.tn' }],
  creator: 'Play.tn',
  publisher: 'Play.tn',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: 'https://play.tn',
    siteName: 'Play.tn',
    title: 'Play.tn | Jeux, Jouets & Gaming en Tunisie',
    description:
      'Votre boutique en ligne de jeux, jouets et accessoires gaming en Tunisie. Livraison rapide partout en Tunisie.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Play.tn - Jeux, Jouets & Gaming en Tunisie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play.tn | Jeux, Jouets & Gaming en Tunisie',
    description:
      'Votre boutique en ligne de jeux, jouets et accessoires gaming en Tunisie.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Play.tn',
  url: 'https://play.tn',
  logo: 'https://play.tn/logo.png',
  description:
    'Boutique en ligne de jeux, jouets et accessoires gaming en Tunisie',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'TN',
    addressLocality: 'Tunis',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+216-XX-XXX-XXX',
    contactType: 'customer service',
    availableLanguage: ['French', 'Arabic'],
  },
  sameAs: [
    'https://www.facebook.com/play.tn',
    'https://www.instagram.com/play.tn',
    'https://www.tiktok.com/@play.tn',
  ],
};

const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Play.tn',
  url: 'https://play.tn',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://play.tn/recherche?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${fredoka.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <StructuredData data={organizationSchema} />
        <StructuredData data={webSiteSchema} />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

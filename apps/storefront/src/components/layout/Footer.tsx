import Link from 'next/link';
import { Gamepad2, MapPin, Phone, Mail } from 'lucide-react';

const navigationLinks = [
  { name: 'Accueil', href: '/' },
  { name: 'Produits', href: '/produits' },
  { name: 'Promotions', href: '/produits?promo=true' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'A propos', href: '/a-propos' },
];

const categoryLinks = [
  { name: 'Accessoires Gaming', href: '/produits?categorie=accessoires-gaming' },
  { name: 'Jeux Video', href: '/produits?categorie=jeux-video' },
  { name: 'Jouets', href: '/produits?categorie=jouets' },
  { name: 'Jeux de Societe', href: '/produits?categorie=jeux-de-societe' },
  { name: 'Jeux Educatifs', href: '/produits?categorie=jeux-educatifs' },
  { name: 'Puzzles', href: '/produits?categorie=puzzles' },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/play.tn' },
  { name: 'Instagram', href: 'https://www.instagram.com/play.tn' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@play.tn' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-100 bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container-page py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* About Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-4 inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                <span className="text-white">Play</span>
                <span className="text-secondary">.tn</span>
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-gray-400">
              Votre boutique en ligne de jeux, jouets et accessoires gaming en
              Tunisie. Nous proposons les meilleures marques aux meilleurs prix
              avec une livraison rapide partout en Tunisie.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-sm font-medium text-gray-400 transition-colors hover:bg-primary hover:text-white"
                  aria-label={`Suivez-nous sur ${social.name}`}
                >
                  {social.name.charAt(0)}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Navigation du pied de page">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Categories Links */}
          <nav aria-label="Categories">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Categories
            </h3>
            <ul className="space-y-3">
              {categoryLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <address className="not-italic">
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-gray-400">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span>Tunis, Tunisie</span>
                </li>
                <li>
                  <a
                    href="tel:+21600000000"
                    className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span>+216 00 000 000</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:contact@play.tn"
                    className="flex items-center gap-3 text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span>contact@play.tn</span>
                  </a>
                </li>
              </ul>
            </address>

            {/* Payment & Delivery Info */}
            <div className="mt-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Paiement securise
              </h4>
              <div className="flex gap-2">
                <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">
                  Carte bancaire
                </span>
                <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">
                  Virement
                </span>
                <span className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-400">
                  Especes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {currentYear} Play.tn. Tous droits reserves.
          </p>
          <div className="flex gap-6">
            <Link
              href="/mentions-legales"
              className="text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              Mentions legales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              Politique de confidentialite
            </Link>
            <Link
              href="/cgv"
              className="text-xs text-gray-500 transition-colors hover:text-gray-300"
            >
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

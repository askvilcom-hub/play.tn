import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Home, MapPin, Phone, Mail, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez l\'equipe Play.tn. Service client disponible 7j/7 par telephone, email ou formulaire de contact.',
};

const contactInfo = [
  {
    icon: Phone,
    title: 'Telephone',
    value: '+216 00 000 000',
    href: 'tel:+21600000000',
    description: 'Du lundi au samedi, 9h - 18h',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'contact@play.tn',
    href: 'mailto:contact@play.tn',
    description: 'Reponse sous 24h',
  },
  {
    icon: MapPin,
    title: 'Adresse',
    value: 'Tunis, Tunisie',
    href: null,
    description: 'Siege social',
  },
  {
    icon: Clock,
    title: 'Horaires',
    value: 'Lun - Sam : 9h - 18h',
    href: null,
    description: 'Support en ligne 7j/7',
  },
];

export default function ContactPage() {
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
            <li className="font-medium text-gray-900">Contact</li>
          </ol>
        </div>
      </nav>

      <div className="container-page py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-3 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Contactez-nous
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500">
            Une question, une reclamation ou besoin d&apos;aide ? Notre equipe est a
            votre disposition.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 p-6 sm:p-8">
              <h2 className="mb-6 font-display text-xl font-bold text-gray-900">
                Envoyez-nous un message
              </h2>
              <form className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Prenom
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="input-field"
                      placeholder="Votre prenom"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="input-field"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Telephone (optionnel)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="input-field"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    className="input-field"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Choisir un sujet
                    </option>
                    <option value="order">Question sur une commande</option>
                    <option value="product">Information produit</option>
                    <option value="return">Retour / Echange</option>
                    <option value="delivery">Livraison</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="input-field resize-none"
                    placeholder="Decrivez votre demande..."
                  />
                </div>

                <button type="submit" className="btn-primary w-full sm:w-auto">
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="flex gap-4 rounded-xl border border-gray-100 p-5"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {info.title}
                    </h3>
                    {info.href ? (
                      <a
                        href={info.href}
                        className="text-sm font-medium text-primary hover:text-primary-700"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-700">
                        {info.value}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-400">
                      {info.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Quick Links */}
            <div className="mt-8 rounded-2xl bg-gray-50 p-6">
              <h3 className="mb-3 font-display text-lg font-bold text-gray-900">
                Questions frequentes
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <span className="font-medium text-gray-900">
                    Quels sont les delais de livraison ?
                  </span>
                  <p className="mt-0.5 text-gray-500">
                    24-48h pour le Grand Tunis, 48-72h pour les autres regions.
                  </p>
                </li>
                <li>
                  <span className="font-medium text-gray-900">
                    Comment retourner un produit ?
                  </span>
                  <p className="mt-0.5 text-gray-500">
                    Vous disposez de 14 jours apres reception pour effectuer un retour gratuit.
                  </p>
                </li>
                <li>
                  <span className="font-medium text-gray-900">
                    Quels modes de paiement acceptez-vous ?
                  </span>
                  <p className="mt-0.5 text-gray-500">
                    Carte bancaire, virement et paiement a la livraison.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

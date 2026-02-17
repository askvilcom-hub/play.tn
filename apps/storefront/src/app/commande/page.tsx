'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  MapPin,
  CreditCard,
  ChevronRight,
  Check,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Banknote,
  Building2,
} from 'lucide-react';
import Button from '@/components/ui/Button';

const GOUVERNORATS = [
  'Ariana',
  'Beja',
  'Ben Arous',
  'Bizerte',
  'Gabes',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kebili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Medenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan',
];

const SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 7;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const steps = [
  { id: 1, label: 'Coordonnees', icon: User },
  { id: 2, label: 'Livraison', icon: MapPin },
  { id: 3, label: 'Paiement', icon: CreditCard },
];

export default function CommandePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const [contact, setContact] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
  });

  const [shipping, setShipping] = useState({
    adresse: '',
    complement: '',
    ville: '',
    codePostal: '',
    gouvernorat: '',
  });

  const [payment, setPayment] = useState('livraison');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('play_tn_cart');
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
    setMounted(true);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  const canProceedStep1 = contact.prenom && contact.nom && contact.email && contact.telephone;
  const canProceedStep2 =
    shipping.adresse && shipping.ville && shipping.codePostal && shipping.gouvernorat;

  const handleSubmit = () => {
    const order = {
      contact,
      shipping,
      payment,
      items: cartItems,
      subtotal,
      shippingCost,
      total,
      date: new Date().toISOString(),
    };
    console.log('Commande soumise:', order);
    alert('Merci pour votre commande ! Vous recevrez un email de confirmation.');
    localStorage.removeItem('play_tn_cart');
  };

  if (!mounted) {
    return (
      <div className="container-page py-16">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="border-b border-gray-100 bg-gray-50">
        <div className="container-page py-3">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-primary">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/panier" className="hover:text-primary">
                Panier
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-gray-900">Commande</li>
          </ol>
        </div>
      </nav>

      <section className="py-10 lg:py-16">
        <div className="container-page">
          <h1 className="mb-8 font-display text-3xl font-bold text-gray-900 sm:text-4xl">
            Finaliser la commande
          </h1>

          {/* Step Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? 'bg-primary text-white'
                        : currentStep > step.id
                          ? 'bg-accent-100 text-accent-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.id}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form Section */}
            <div className="lg:col-span-2">
              {/* Step 1: Contact */}
              {currentStep === 1 && (
                <div className="card p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-3 font-display text-xl font-bold text-gray-900">
                    <User className="h-6 w-6 text-primary" />
                    Vos coordonnees
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Prenom *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Votre prenom"
                        value={contact.prenom}
                        onChange={(e) => setContact({ ...contact, prenom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Nom *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Votre nom"
                        value={contact.nom}
                        onChange={(e) => setContact({ ...contact, nom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        className="input-field"
                        placeholder="votre@email.com"
                        value={contact.email}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Telephone *
                      </label>
                      <input
                        type="tel"
                        className="input-field"
                        placeholder="+216 XX XXX XXX"
                        value={contact.telephone}
                        onChange={(e) => setContact({ ...contact, telephone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                      disabled={!canProceedStep1}
                    >
                      Continuer vers la livraison
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping */}
              {currentStep === 2 && (
                <div className="card p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-3 font-display text-xl font-bold text-gray-900">
                    <MapPin className="h-6 w-6 text-primary" />
                    Adresse de livraison
                  </h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Adresse *
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Numero et nom de rue"
                        value={shipping.adresse}
                        onChange={(e) => setShipping({ ...shipping, adresse: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Complement d&apos;adresse
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Appartement, etage, etc. (optionnel)"
                        value={shipping.complement}
                        onChange={(e) =>
                          setShipping({ ...shipping, complement: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Ville *
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Votre ville"
                          value={shipping.ville}
                          onChange={(e) => setShipping({ ...shipping, ville: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Code postal *
                        </label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="1000"
                          value={shipping.codePostal}
                          onChange={(e) =>
                            setShipping({ ...shipping, codePostal: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                          Gouvernorat *
                        </label>
                        <select
                          className="input-field"
                          value={shipping.gouvernorat}
                          onChange={(e) =>
                            setShipping({ ...shipping, gouvernorat: e.target.value })
                          }
                          required
                        >
                          <option value="">Choisir...</option>
                          {GOUVERNORATS.map((gov) => (
                            <option key={gov} value={gov}>
                              {gov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setCurrentStep(3)}
                      disabled={!canProceedStep2}
                    >
                      Continuer vers le paiement
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="card p-6 sm:p-8">
                  <h2 className="mb-6 flex items-center gap-3 font-display text-xl font-bold text-gray-900">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Mode de paiement
                  </h2>
                  <div className="space-y-3">
                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${
                        payment === 'carte'
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="carte"
                        checked={payment === 'carte'}
                        onChange={(e) => setPayment(e.target.value)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <CreditCard className="h-6 w-6 text-gray-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Carte bancaire</span>
                        <p className="text-sm text-gray-500">
                          Visa, Mastercard - Paiement securise
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${
                        payment === 'livraison'
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="livraison"
                        checked={payment === 'livraison'}
                        onChange={(e) => setPayment(e.target.value)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <Banknote className="h-6 w-6 text-gray-600" />
                      <div>
                        <span className="font-semibold text-gray-900">
                          Paiement a la livraison
                        </span>
                        <p className="text-sm text-gray-500">
                          Payez en especes a la reception de votre commande
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${
                        payment === 'virement'
                          ? 'border-primary bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="virement"
                        checked={payment === 'virement'}
                        onChange={(e) => setPayment(e.target.value)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <Building2 className="h-6 w-6 text-gray-600" />
                      <div>
                        <span className="font-semibold text-gray-900">Virement bancaire</span>
                        <p className="text-sm text-gray-500">
                          Transfert direct vers notre compte bancaire
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ShieldCheck className="h-5 w-5 text-accent-600" />
                      <span>
                        Vos informations de paiement sont protegees et securisees.
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour
                    </button>
                    <Button variant="primary" size="lg" onClick={handleSubmit}>
                      Confirmer la commande
                      <Check className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24 p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-gray-900">
                  Votre commande
                </h2>

                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500">Votre panier est vide.</p>
                ) : (
                  <>
                    <div className="max-h-64 space-y-3 overflow-y-auto border-b border-gray-100 pb-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            <span className="text-[8px] text-gray-400">{item.name}</span>
                          </div>
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {item.name}
                            </p>
                            <p className="text-gray-500">Qte: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} TND
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sous-total</span>
                        <span className="font-medium">{subtotal.toFixed(2)} TND</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Livraison</span>
                        <span className="font-medium">
                          {shippingCost === 0 ? (
                            <span className="text-accent-600">Gratuite</span>
                          ) : (
                            `${shippingCost.toFixed(2)} TND`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-100 pt-3">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gray-900">
                          {total.toFixed(2)} TND
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
                  <Truck className="h-4 w-4" />
                  <span>Livraison estimee sous 24-48h</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

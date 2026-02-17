import { Router, Request, Response } from 'express';

/**
 * Routes pour le tableau de bord admin.
 * Fournit les statistiques globales de la plateforme.
 */

const router = Router();

/**
 * GET /api/admin/dashboard/stats
 * Retourne les statistiques generales du tableau de bord.
 */
router.get('/stats', (_req: Request, res: Response) => {
  // TODO: Agreger les donnees reelles depuis Firestore
  // - Compter les commandes (total + par statut)
  // - Calculer le chiffre d'affaires (somme des commandes payees)
  // - Compter les clients inscrits
  // - Compter les produits actifs
  // - Calculer les tendances (comparaison avec la periode precedente)

  const stats = {
    orders: {
      total: 1042,
      pending: 12,
      confirmed: 8,
      processing: 5,
      shipped: 15,
      delivered: 987,
      cancelled: 15,
      trend: +8.3, // Pourcentage de variation vs mois precedent
    },
    revenue: {
      total: 285430.5, // En TND (Dinar Tunisien)
      thisMonth: 42350.0,
      lastMonth: 38200.0,
      trend: +10.9,
    },
    customers: {
      total: 3256,
      newThisMonth: 187,
      activeThisMonth: 842,
      trend: +5.7,
    },
    products: {
      total: 156,
      active: 134,
      outOfStock: 12,
      draft: 10,
    },
    recentOrders: [
      {
        id: 'ORD-1042',
        customer: 'Ahmed Ben Ali',
        total: 386.8,
        status: 'confirmed',
        date: '2026-02-16T14:30:00Z',
      },
      {
        id: 'ORD-1041',
        customer: 'Fatma Trabelsi',
        total: 608.0,
        status: 'shipped',
        date: '2026-02-15T09:20:00Z',
      },
      {
        id: 'ORD-1040',
        customer: 'Youssef Khelifi',
        total: 196.9,
        status: 'delivered',
        date: '2026-02-10T11:00:00Z',
      },
      {
        id: 'ORD-1039',
        customer: 'Mariem Jlassi',
        total: 529.0,
        status: 'delivered',
        date: '2026-02-09T17:45:00Z',
      },
      {
        id: 'ORD-1038',
        customer: 'Karim Bouazizi',
        total: 189.9,
        status: 'cancelled',
        date: '2026-02-08T10:15:00Z',
      },
    ],
    topProducts: [
      { id: 'prod_001', name: 'Manette PS5 DualSense', sold: 234, revenue: 44467.6 },
      { id: 'prod_002', name: 'Casque Gaming HyperX Cloud III', sold: 156, revenue: 40404.0 },
      { id: 'prod_003', name: 'Clavier Razer BlackWidow V4', sold: 98, revenue: 34202.0 },
      { id: 'prod_004', name: 'Souris Logitech G Pro X', sold: 87, revenue: 21750.0 },
      { id: 'prod_005', name: 'Ecran Samsung Odyssey G5', sold: 62, revenue: 55800.0 },
    ],
  };

  res.json({
    success: true,
    data: stats,
  });
});

export default router;

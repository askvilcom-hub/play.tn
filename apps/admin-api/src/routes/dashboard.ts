import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Routes pour le tableau de bord admin.
 * Fournit les statistiques globales de la plateforme depuis Firestore.
 */

const router = Router();

const ordersCol = db.collection('orders');
const productsCol = db.collection('products');
const usersCol = db.collection('users');

/**
 * GET /api/admin/dashboard/stats
 * Retourne les statistiques generales du tableau de bord.
 */
router.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    // Recuperer toutes les commandes
    const ordersSnapshot = await ordersCol.get();
    const allOrders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as any[];

    // Compter les commandes par statut
    const ordersByStatus: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    for (const order of allOrders) {
      const status = order.status || 'pending';
      if (ordersByStatus[status] !== undefined) {
        ordersByStatus[status]++;
      }

      // Calculer le revenu (commandes non annulees/remboursees)
      if (!['cancelled', 'refunded'].includes(status)) {
        const orderTotal = Number(order.total) || 0;
        totalRevenue += orderTotal;

        if (order.createdAt >= thisMonthStart) {
          thisMonthRevenue += orderTotal;
        } else if (order.createdAt >= lastMonthStart && order.createdAt <= lastMonthEnd) {
          lastMonthRevenue += orderTotal;
        }
      }
    }

    const revenueTrend = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
      : 0;

    // Compter les clients
    const usersSnapshot = await usersCol.get();
    const totalCustomers = usersSnapshot.size;
    let newThisMonth = 0;
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      if (userData.createdAt && userData.createdAt >= thisMonthStart) {
        newThisMonth++;
      }
    }

    // Compter les produits
    const productsSnapshot = await productsCol.get();
    let activeProducts = 0;
    let outOfStockProducts = 0;
    let draftProducts = 0;

    // Map pour le calcul des top produits
    const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};

    for (const prodDoc of productsSnapshot.docs) {
      const prodData = prodDoc.data();
      if (prodData.status === 'active') activeProducts++;
      else if (prodData.status === 'out_of_stock') outOfStockProducts++;
      else if (prodData.status === 'draft') draftProducts++;
    }

    // Calculer les top produits a partir des commandes
    for (const order of allOrders) {
      if (['cancelled', 'refunded'].includes(order.status)) continue;
      const items = order.items || [];
      for (const item of items) {
        const pid = item.productId || item.id;
        if (!pid) continue;
        if (!productSales[pid]) {
          productSales[pid] = { name: item.name || 'Produit inconnu', sold: 0, revenue: 0 };
        }
        productSales[pid].sold += Number(item.quantity) || 0;
        productSales[pid].revenue += Number(item.total || (item.price * item.quantity)) || 0;
      }
    }

    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Commandes recentes
    const recentOrders = [...allOrders]
      .sort((a, b) => {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        customer: order.customer?.name || 'Client inconnu',
        total: order.total || 0,
        status: order.status || 'pending',
        date: order.createdAt || null,
      }));

    // Tendance commandes (ce mois vs mois dernier)
    const ordersThisMonth = allOrders.filter((o) => o.createdAt >= thisMonthStart).length;
    const ordersLastMonth = allOrders.filter(
      (o) => o.createdAt >= lastMonthStart && o.createdAt <= lastMonthEnd
    ).length;
    const ordersTrend = ordersLastMonth > 0
      ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 1000) / 10
      : 0;

    const customersTrend = (totalCustomers - newThisMonth) > 0
      ? Math.round((newThisMonth / (totalCustomers - newThisMonth)) * 1000) / 10
      : 0;

    const stats = {
      orders: {
        total: allOrders.length,
        ...ordersByStatus,
        trend: ordersTrend,
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        thisMonth: Math.round(thisMonthRevenue * 100) / 100,
        lastMonth: Math.round(lastMonthRevenue * 100) / 100,
        trend: revenueTrend,
      },
      customers: {
        total: totalCustomers,
        newThisMonth,
        trend: customersTrend,
      },
      products: {
        total: productsSnapshot.size,
        active: activeProducts,
        outOfStock: outOfStockProducts,
        draft: draftProducts,
      },
      recentOrders,
      topProducts,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('[Dashboard] Erreur lors de la recuperation des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des statistiques du tableau de bord',
    });
  }
});

export default router;

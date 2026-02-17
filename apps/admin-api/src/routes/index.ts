import { Router } from 'express';
import productsRouter from './products';
import ordersRouter from './orders';
import dashboardRouter from './dashboard';

/**
 * Aggregateur de routes admin.
 * Monte toutes les sous-routes pour l'API d'administration.
 */

const router = Router();

// Routes implementees
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/dashboard', dashboardRouter);

// --- Routes placeholder (a implementer) ---

// TODO: Implementer les routes categories
router.use('/categories', (_req, res) => {
  res.json({ success: true, message: 'Route categories - TODO', data: [] });
});

// TODO: Implementer les routes clients
router.use('/customers', (_req, res) => {
  res.json({ success: true, message: 'Route customers - TODO', data: [] });
});

// TODO: Implementer les routes coupons
router.use('/coupons', (_req, res) => {
  res.json({ success: true, message: 'Route coupons - TODO', data: [] });
});

// TODO: Implementer les routes blog
router.use('/blog', (_req, res) => {
  res.json({ success: true, message: 'Route blog - TODO', data: [] });
});

// TODO: Implementer les routes parametres
router.use('/settings', (_req, res) => {
  res.json({ success: true, message: 'Route settings - TODO', data: {} });
});

// TODO: Implementer les routes logs d'audit
router.use('/audit-logs', (_req, res) => {
  res.json({ success: true, message: 'Route audit-logs - TODO', data: [] });
});

export default router;

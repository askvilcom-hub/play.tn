import { Router } from 'express';
import productsRouter from './products';
import ordersRouter from './orders';
import dashboardRouter from './dashboard';
import categoriesRouter from './categories';
import customersRouter from './customers';
import couponsRouter from './coupons';
import settingsRouter from './settings';
import auditLogsRouter from './audit-logs';
import blogRouter from './blog';

/**
 * Aggregateur de routes admin.
 * Monte toutes les sous-routes pour l'API d'administration.
 */

const router = Router();

router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
router.use('/dashboard', dashboardRouter);
router.use('/categories', categoriesRouter);
router.use('/customers', customersRouter);
router.use('/coupons', couponsRouter);
router.use('/settings', settingsRouter);
router.use('/audit-logs', auditLogsRouter);
router.use('/blog', blogRouter);

export default router;

import { Router } from 'express';
import productsRouter from './products';
import categoriesRouter from './categories';
import cartRouter from './cart';
import ordersRouter from './orders';
import authRouter from './auth';
import reviewsRouter from './reviews';
import searchRouter from './search';
import blogRouter from './blog';

const router = Router();

// ---------------------------------------------------------------------------
// Sub-routers
// ---------------------------------------------------------------------------
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/auth', authRouter);
router.use('/reviews', reviewsRouter);
router.use('/search', searchRouter);
router.use('/blog', blogRouter);

export default router;

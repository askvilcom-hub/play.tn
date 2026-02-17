import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validate';
import { db, auth, COLLECTIONS } from '../config/firebase';

const router = Router();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
  phone: z.string().min(8, 'Le numéro de téléphone est requis.').optional(),
  firebaseToken: z.string().min(1, 'Le token Firebase est requis.'),
});

const loginSchema = z.object({
  firebaseToken: z.string().min(1, 'Le token Firebase est requis.'),
});

const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères.').optional(),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.').optional(),
  phone: z.string().min(8, 'Le numéro de téléphone est requis.').optional(),
  address: z
    .object({
      address: z.string().optional(),
      city: z.string().optional(),
      governorate: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
});

// ---------------------------------------------------------------------------
// POST /api/auth/register — Register a new user (after Firebase Auth signup)
// ---------------------------------------------------------------------------
router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, firstName, lastName, phone, firebaseToken } =
      req.body as z.infer<typeof registerSchema>;

    // 1. Verify the Firebase token to get the uid
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(firebaseToken);
    } catch {
      throw new AppError('Token Firebase invalide ou expiré.', 401);
    }

    // 2. Check if user doc already exists
    const existingUser = await db
      .collection(COLLECTIONS.USERS)
      .doc(decodedToken.uid)
      .get();

    if (existingUser.exists) {
      throw new AppError('Un compte existe déjà avec cet e-mail.', 409);
    }

    // 3. Create user document in Firestore
    const userData = {
      email,
      firstName,
      lastName,
      phone: phone || null,
      role: 'customer',
      addresses: [],
      wishlist: [],
      isActive: true,
      emailVerified: decodedToken.email_verified || false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTIONS.USERS).doc(decodedToken.uid).set(userData);

    // 4. Create an empty cart for the user
    await db.collection(COLLECTIONS.CARTS).doc(decodedToken.uid).set({
      items: [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      data: {
        user: {
          id: decodedToken.uid,
          email,
          firstName,
          lastName,
          phone: phone || null,
          role: 'customer',
          createdAt: new Date().toISOString(),
        },
      },
    });
  })
);

// ---------------------------------------------------------------------------
// POST /api/auth/login — Verify Firebase token & return user profile
// ---------------------------------------------------------------------------
router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firebaseToken } = req.body as z.infer<typeof loginSchema>;

    // 1. Verify the Firebase token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(firebaseToken);
    } catch {
      throw new AppError('Token Firebase invalide ou expiré.', 401);
    }

    // 2. Get user document from Firestore
    const userDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      throw new AppError(
        'Utilisateur introuvable. Veuillez vous inscrire.',
        404
      );
    }

    const userData = userDoc.data()!;

    // 3. Update last login timestamp
    await userDoc.ref.update({
      lastLoginAt: FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      message: 'Connexion réussie.',
      data: {
        user: {
          id: decodedToken.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || null,
          role: userData.role || 'customer',
          address: userData.address || null,
          addresses: userData.addresses || [],
          createdAt: userData.createdAt?.toDate?.().toISOString() || userData.createdAt,
          lastLoginAt: new Date().toISOString(),
        },
      },
    });
  })
);

// ---------------------------------------------------------------------------
// GET /api/auth/profile — Get the authenticated user's profile
// ---------------------------------------------------------------------------
router.get(
  '/profile',
  requireAuth,
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;

    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

    if (!userDoc.exists) {
      throw new AppError('Profil introuvable.', 404);
    }

    const userData = userDoc.data()!;

    // Get order count
    const ordersSnapshot = await db
      .collection(COLLECTIONS.ORDERS)
      .where('userId', '==', userId)
      .count()
      .get();
    const orderCount = ordersSnapshot.data().count;

    res.json({
      success: true,
      data: {
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || null,
        role: userData.role || 'customer',
        address: userData.address || null,
        addresses: userData.addresses || [],
        wishlist: userData.wishlist || [],
        orderCount,
        createdAt: userData.createdAt?.toDate?.().toISOString() || userData.createdAt,
        updatedAt: userData.updatedAt?.toDate?.().toISOString() || userData.updatedAt,
      },
    });
  })
);

// ---------------------------------------------------------------------------
// PATCH /api/auth/profile — Update the authenticated user's profile
// ---------------------------------------------------------------------------
router.patch(
  '/profile',
  requireAuth,
  validateBody(updateProfileSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const updates = req.body as z.infer<typeof updateProfileSchema>;

    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new AppError('Profil introuvable.', 404);
    }

    await userRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updatedDoc = await userRef.get();
    const updatedData = updatedDoc.data()!;

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      data: {
        id: userId,
        email: updatedData.email,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        phone: updatedData.phone || null,
        role: updatedData.role || 'customer',
        address: updatedData.address || null,
        addresses: updatedData.addresses || [],
        updatedAt: updatedData.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
      },
    });
  })
);

export default router;

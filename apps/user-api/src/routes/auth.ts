import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody } from '../middleware/validate';

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

    // TODO: Replace with real Firebase / Firestore logic
    // 1. Verify the Firebase token to get the uid
    // const decodedToken = await auth.verifyIdToken(firebaseToken);
    //
    // 2. Check if user doc already exists
    // const existingUser = await db.collection(COLLECTIONS.USERS).doc(decodedToken.uid).get();
    // if (existingUser.exists) throw new AppError('Un compte existe déjà avec cet e-mail.', 409);
    //
    // 3. Create user document in Firestore
    // await db.collection(COLLECTIONS.USERS).doc(decodedToken.uid).set({
    //   email,
    //   firstName,
    //   lastName,
    //   phone: phone || null,
    //   role: 'customer',
    //   createdAt: FieldValue.serverTimestamp(),
    //   updatedAt: FieldValue.serverTimestamp(),
    // });
    //
    // 4. Create an empty cart for the user
    // await db.collection(COLLECTIONS.CARTS).doc(decodedToken.uid).set({ items: [] });

    const mockUser = {
      id: 'uid_new_user_001',
      email,
      firstName,
      lastName,
      phone: phone || null,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès.',
      data: { user: mockUser },
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

    // TODO: Replace with real Firebase / Firestore logic
    // 1. Verify the Firebase token
    // const decodedToken = await auth.verifyIdToken(firebaseToken);
    //
    // 2. Get user document from Firestore
    // const userDoc = await db.collection(COLLECTIONS.USERS).doc(decodedToken.uid).get();
    // if (!userDoc.exists) throw new AppError('Utilisateur introuvable. Veuillez vous inscrire.', 404);
    //
    // 3. Update last login timestamp
    // await userDoc.ref.update({ lastLoginAt: FieldValue.serverTimestamp() });

    const mockUser = {
      id: 'uid_user_001',
      email: 'ahmed@example.com',
      firstName: 'Ahmed',
      lastName: 'Ben Ali',
      phone: '+216 50 123 456',
      role: 'customer',
      address: {
        address: '15 Rue de la Liberté',
        city: 'Tunis',
        governorate: 'Tunis',
        postalCode: '1000',
      },
      createdAt: '2025-01-10T08:00:00Z',
      lastLoginAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Connexion réussie.',
      data: { user: mockUser },
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

    // TODO: Replace with real Firestore query
    // const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    // if (!userDoc.exists) throw new AppError('Profil introuvable.', 404);
    // const userData = userDoc.data();

    const mockProfile = {
      id: userId,
      email: req.user!.email || 'ahmed@example.com',
      firstName: req.user!.firstName || 'Ahmed',
      lastName: req.user!.lastName || 'Ben Ali',
      phone: '+216 50 123 456',
      role: req.user!.role || 'customer',
      address: {
        address: '15 Rue de la Liberté',
        city: 'Tunis',
        governorate: 'Tunis',
        postalCode: '1000',
      },
      orderCount: 5,
      createdAt: '2025-01-10T08:00:00Z',
      updatedAt: '2025-02-15T12:00:00Z',
    };

    res.json({
      success: true,
      data: mockProfile,
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

    // TODO: Replace with real Firestore logic
    // const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    // const userDoc = await userRef.get();
    // if (!userDoc.exists) throw new AppError('Profil introuvable.', 404);
    //
    // await userRef.update({
    //   ...updates,
    //   updatedAt: FieldValue.serverTimestamp(),
    // });
    //
    // const updatedDoc = await userRef.get();
    // const updatedData = updatedDoc.data();

    const mockUpdatedProfile = {
      id: userId,
      email: req.user!.email || 'ahmed@example.com',
      firstName: updates.firstName || req.user!.firstName || 'Ahmed',
      lastName: updates.lastName || req.user!.lastName || 'Ben Ali',
      phone: updates.phone || '+216 50 123 456',
      role: req.user!.role || 'customer',
      address: updates.address || {
        address: '15 Rue de la Liberté',
        city: 'Tunis',
        governorate: 'Tunis',
        postalCode: '1000',
      },
      updatedAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès.',
      data: mockUpdatedProfile,
    });
  })
);

export default router;

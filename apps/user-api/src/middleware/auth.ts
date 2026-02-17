import { Request, Response, NextFunction } from 'express';
import { auth, db, COLLECTIONS } from '../config/firebase';

/**
 * Middleware d'authentification obligatoire.
 * Extrait le token Bearer, le vérifie via Firebase Auth
 * et attache les informations utilisateur à req.user.
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentification requise. Veuillez fournir un token valide.',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Token d\'authentification manquant.',
      });
      return;
    }

    const decodedToken = await auth.verifyIdToken(token);

    // Récupérer les données utilisateur depuis Firestore pour avoir le rôle
    const userDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(decodedToken.uid)
      .get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      req.user = {
        ...decodedToken,
        role: userData?.role || 'customer',
        firstName: userData?.firstName,
        lastName: userData?.lastName,
      };
    } else {
      req.user = {
        ...decodedToken,
        role: 'customer',
      };
    }

    next();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erreur inconnue';

    if (
      message.includes('auth/id-token-expired') ||
      message.includes('expired')
    ) {
      res.status(401).json({
        success: false,
        error: 'Le token a expiré. Veuillez vous reconnecter.',
      });
      return;
    }

    if (
      message.includes('auth/argument-error') ||
      message.includes('Decoding Firebase ID token failed')
    ) {
      res.status(401).json({
        success: false,
        error: 'Token invalide. Veuillez vous reconnecter.',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Erreur d\'authentification. Veuillez réessayer.',
    });
  }
};

/**
 * Middleware d'authentification optionnelle.
 * Si un token est fourni, il est vérifié et les informations utilisateur
 * sont attachées. Sinon, la requête continue sans erreur.
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      next();
      return;
    }

    const decodedToken = await auth.verifyIdToken(token);

    const userDoc = await db
      .collection(COLLECTIONS.USERS)
      .doc(decodedToken.uid)
      .get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      req.user = {
        ...decodedToken,
        role: userData?.role || 'customer',
        firstName: userData?.firstName,
        lastName: userData?.lastName,
      };
    } else {
      req.user = {
        ...decodedToken,
        role: 'customer',
      };
    }

    next();
  } catch {
    // En cas d'erreur, on continue sans authentification
    next();
  }
};

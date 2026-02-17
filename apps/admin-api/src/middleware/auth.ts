import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

/**
 * Interface etendue pour ajouter les informations utilisateur a la requete.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
    displayName?: string;
  };
}

/**
 * Middleware d'authentification admin.
 * Verifie le token Firebase et s'assure que l'utilisateur a le role admin.
 *
 * Usage:
 *   router.get('/protected', requireAdmin, (req, res) => { ... });
 */
export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant. Format attendu: Bearer <token>',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token invalide',
      });
      return;
    }

    // TODO: En production, verifier le token Firebase reel
    // Pour le developpement, on peut accepter un token de test
    let decodedToken;

    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (firebaseError) {
      console.error('[Auth] Erreur de verification du token Firebase:', firebaseError);
      res.status(401).json({
        success: false,
        message: 'Token d\'authentification invalide ou expire',
      });
      return;
    }

    // Verifier le role admin via les custom claims Firebase
    // TODO: Configurer les custom claims lors de la creation des comptes admin
    // await auth.setCustomUserClaims(uid, { role: 'admin' });
    const role = (decodedToken.role || (decodedToken.admin ? 'admin' : 'user'));

    if (role !== 'admin') {
      console.warn(
        `[Auth] Acces refuse pour l'utilisateur ${decodedToken.email} (role: ${role})`
      );
      res.status(403).json({
        success: false,
        message: 'Acces refuse. Droits administrateur requis.',
      });
      return;
    }

    // Attacher les informations de l'utilisateur a la requete
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: 'admin',
      displayName: decodedToken.name || undefined,
    };

    next();
  } catch (error) {
    console.error('[Auth] Erreur inattendue dans le middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification interne',
    });
  }
}

/**
 * Middleware optionnel: verifie l'authentification sans exiger le role admin.
 * Utile pour des routes accessibles a tous les utilisateurs authentifies.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Token d\'authentification manquant',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'user',
      displayName: decodedToken.name || undefined,
    };

    next();
  } catch (error) {
    console.error('[Auth] Erreur de verification du token:', error);
    res.status(401).json({
      success: false,
      message: 'Token d\'authentification invalide ou expire',
    });
  }
}

export default { requireAdmin, requireAuth };

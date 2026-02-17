import { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

/**
 * Configuration Firebase pour le panneau admin.
 * TODO: Deplacer dans un fichier de config separe et utiliser des variables d'environnement.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'play-tn.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'play-tn',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'play-tn.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Initialiser Firebase (eviter la double initialisation)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth = getAuth(app);

/**
 * Interface pour le retour du hook useAuth.
 */
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook d'authentification pour le panneau admin.
 * Utilise Firebase Authentication avec email/mot de passe.
 *
 * Usage:
 *   const { user, loading, login, logout } = useAuth();
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ecouter les changements d'etat d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Connexion avec email et mot de passe.
   */
  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      // TODO: Verifier que l'utilisateur a le role admin via les custom claims
      // const tokenResult = await firebaseAuth.currentUser?.getIdTokenResult();
      // if (!tokenResult?.claims?.admin) { throw new Error('Acces non autorise'); }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur de connexion';

      // Traduire les erreurs Firebase courantes en francais
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Aucun compte ne correspond a cet email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/too-many-requests':
          'Trop de tentatives. Veuillez reessayer plus tard.',
        'auth/user-disabled': 'Ce compte a ete desactive.',
        'auth/invalid-credential': 'Identifiants invalides.',
      };

      const code = (err as { code?: string })?.code || '';
      setError(errorMap[code] || message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Deconnexion de l'utilisateur.
   */
  const logout = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      console.error('[Auth] Erreur lors de la deconnexion:', err);
    }
  }, []);

  return { user, loading, error, login, logout };
}

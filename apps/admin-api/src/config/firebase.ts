import * as admin from 'firebase-admin';
import path from 'path';

/**
 * Initialisation du SDK Firebase Admin pour le service admin-api.
 * Instance separee du user-api pour isolation des services.
 */
function initializeFirebaseAdmin(): admin.app.App {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'play-tn';

  // Utiliser le fichier de compte de service si disponible
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(resolvedPath);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      }, 'admin-api');
    } catch {
      console.warn(
        '[Firebase Admin] Impossible de charger le compte de service, utilisation des credentials par defaut.'
      );
    }
  }

  // Fallback: Application Default Credentials (Cloud Run, GCE, etc.)
  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  }, 'admin-api');
}

let app: admin.app.App;

try {
  app = admin.app('admin-api');
} catch {
  app = initializeFirebaseAdmin();
}

export const firebaseApp = app;
export const db = admin.firestore(app);
export const auth = admin.auth(app);

// Configuration Firestore
db.settings({ ignoreUndefinedProperties: true });

export default { firebaseApp, db, auth };

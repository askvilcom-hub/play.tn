import { Storage } from '@google-cloud/storage';
import path from 'path';

/**
 * Client Google Cloud Storage pour la gestion des medias.
 * Utilise pour l'upload d'images produits, logos de marques,
 * images de blog, et autres fichiers media.
 */
function createStorageClient(): Storage {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountPath) {
    const resolvedPath = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.resolve(process.cwd(), serviceAccountPath);

    try {
      return new Storage({
        projectId: process.env.FIREBASE_PROJECT_ID || 'play-tn',
        keyFilename: resolvedPath,
      });
    } catch {
      console.warn(
        '[GCS] Impossible de charger le compte de service, utilisation des credentials par defaut.'
      );
    }
  }

  return new Storage({
    projectId: process.env.FIREBASE_PROJECT_ID || 'play-tn',
  });
}

export const storage = createStorageClient();

export const bucketName = process.env.GCS_BUCKET_NAME || 'play-tn-media';

export const bucket = storage.bucket(bucketName);

/**
 * Types MIME autorises pour l'upload de medias
 */
export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

/**
 * Taille maximale de fichier (5 Mo)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Genere une URL publique pour un fichier GCS
 */
export function getPublicUrl(fileName: string): string {
  return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

export default { storage, bucket, bucketName, getPublicUrl };

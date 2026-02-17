import { Request, Response, NextFunction } from 'express';

/**
 * Classe d'erreur personnalisée avec code de statut HTTP.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Middleware de gestion globale des erreurs.
 * Retourne des erreurs structurées en JSON avec les messages en français.
 */
export const globalErrorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Valeurs par défaut
  let statusCode = 500;
  let message = 'Une erreur interne est survenue. Veuillez réessayer plus tard.';
  let isOperational = false;

  // Erreur opérationnelle connue
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  // Erreurs Firestore
  if (err.message?.includes('NOT_FOUND') || err.message?.includes('not-found')) {
    statusCode = 404;
    message = 'Ressource introuvable.';
    isOperational = true;
  }

  if (err.message?.includes('PERMISSION_DENIED')) {
    statusCode = 403;
    message = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
    isOperational = true;
  }

  if (err.message?.includes('ALREADY_EXISTS')) {
    statusCode = 409;
    message = 'Cette ressource existe déjà.';
    isOperational = true;
  }

  // Erreur de parsing JSON
  if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    message = 'Format JSON invalide dans le corps de la requête.';
    isOperational = true;
  }

  // Erreur de payload trop large
  if (err.message?.includes('request entity too large')) {
    statusCode = 413;
    message = 'La taille de la requête dépasse la limite autorisée.';
    isOperational = true;
  }

  // Log en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      statusCode,
      message: err.message,
      stack: err.stack,
      isOperational,
    });
  } else if (!isOperational) {
    // Log des erreurs non-opérationnelles en production
    console.error('[Critical Error]', {
      message: err.message,
      stack: err.stack,
    });
  }

  const response: Record<string, unknown> = {
    success: false,
    error: message,
  };

  // Inclure la stack trace uniquement en développement
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware pour les routes non trouvées (404).
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} introuvable.`,
  });
};

/**
 * Wrapper async pour les handlers Express.
 * Capture automatiquement les erreurs des fonctions async.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

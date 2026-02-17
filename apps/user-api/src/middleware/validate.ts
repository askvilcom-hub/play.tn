import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Factory de middleware de validation Zod.
 * Valide body, query et/ou params de la requête.
 */
export function validate(schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          champ: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Données de requête invalides.',
          details: formattedErrors,
        });
        return;
      }

      next(error);
    }
  };
}

/**
 * Middleware de validation du body uniquement (raccourci).
 */
export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

/**
 * Middleware de validation des query params uniquement (raccourci).
 */
export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

/**
 * Middleware de validation des params uniquement (raccourci).
 */
export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import adminRoutes from './routes';

/**
 * Point d'entree principal du serveur Admin API.
 * Service backend dedie a l'administration de play.tn.
 */

const app = express();

// --- Middleware de securite et utilitaires ---

// Protection HTTP headers
app.use(helmet());

// CORS - autorise le frontend admin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compression des reponses
app.use(compression());

// Logging des requetes HTTP
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parsing JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Health check ---
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'admin-api',
    timestamp: new Date().toISOString(),
  });
});

// --- Routes admin ---
app.use('/api/admin', adminRoutes);

// --- 404 handler ---
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvee',
  });
});

// --- Error handler global ---
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[Admin API Error]', err.message);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === 'production'
          ? 'Erreur interne du serveur'
          : err.message,
    });
  }
);

// --- Demarrage du serveur ---
const PORT = parseInt(process.env.PORT || '4002', 10);

app.listen(PORT, () => {
  console.log(`[Admin API] Serveur demarre sur le port ${PORT}`);
  console.log(`[Admin API] Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[Admin API] Health check: http://localhost:${PORT}/health`);
});

export default app;

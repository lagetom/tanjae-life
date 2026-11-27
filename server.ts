import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  checkRateLimit,
  handleChartSummaryRequest,
  handleRelationshipRequest,
  handleReportRequest,
  resolveAllowedCorsOrigin,
} from './server/apiHandlers.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  // Security headers, optional allowlisted CORS, and rate limiting for /api/*
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');

    const origin = req.headers.origin;
    const allowedOrigin = resolveAllowedCorsOrigin(origin, process.env.ALLOWED_ORIGINS);

    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (req.method === 'POST') {
      const requestedWith = req.headers['x-requested-with'];
      if (requestedWith !== 'ChasaJaeClient' && !allowedOrigin) {
        res.status(403).json({ ok: false, error: '허용되지 않은 요청 출처입니다.' });
        return;
      }
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
      req.socket.remoteAddress ||
      'local';

    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSec));
      res.status(429).json({
        ok: false,
        error: '요청이 잠시 몰렸습니다. 몇 초 뒤 다시 시도해 주세요.',
      });
      return;
    }

    next();
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/report', (req: Request, res: Response) => {
    const result = handleReportRequest(req.body);
    res.status(result.status).json(result.payload);
  });

  app.post('/api/chart-summary', (req: Request, res: Response) => {
    const result = handleChartSummaryRequest(req.body);
    res.status(result.status).json(result.payload);
  });

  app.post('/api/relationship', (req: Request, res: Response) => {
    const result = handleRelationshipRequest(req.body);
    res.status(result.status).json(result.payload);
  });

  // Catch malformed JSON payloads cleanly
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err && typeof err === 'object' && 'status' in err) {
      res.status(400).json({ ok: false, error: '요청 데이터 형식이 올바르지 않습니다.' });
      return;
    }
    next(err);
  });

  const isProd =
    process.env.NODE_ENV === 'production' ||
    (fs.existsSync(path.resolve(__dirname, 'dist/index.html')) &&
      process.env.npm_lifecycle_event === 'start');

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    const indexHtml = path.resolve(distDir, 'index.html');
    app.use(express.static(distDir, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ ok: false, error: '존재하지 않는 API 경로입니다.' });
        return;
      }
      res.sendFile(indexHtml);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

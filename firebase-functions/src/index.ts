import { onRequest } from 'firebase-functions/v2/https';
import {
  checkRateLimit,
  handleChartSummaryRequest,
  handleRelationshipRequest,
  handleReportRequest,
  resolveAllowedCorsOrigin,
} from '../../server/apiHandlers.ts';

const MAX_BODY_BYTES = 32 * 1024;

export const api = onRequest(
  {
    region: 'asia-northeast3',
    memory: '256MiB',
    timeoutSeconds: 15,
    maxInstances: 3,
  },
  (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');

    const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
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

    const rawPath = (req.path || '/').replace(/\/+$/, '') || '/';
    const normalizedPath = rawPath.startsWith('/api/') ? rawPath : `/api${rawPath}`;

    if (req.method === 'GET' && normalizedPath === '/api/health') {
      res.status(200).json({ ok: true });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: '허용되지 않은 요청 방식입니다.' });
      return;
    }

    const requestedWith = req.headers['x-requested-with'];
    if (requestedWith !== 'ChasaJaeClient' && !allowedOrigin) {
      res.status(403).json({ ok: false, error: '허용되지 않은 요청 출처입니다.' });
      return;
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const clientIp =
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : '') ||
      req.ip ||
      'fb-edge';

    const rate = checkRateLimit(clientIp);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSec));
      res.status(429).json({
        ok: false,
        error: '요청이 잠시 몰렸습니다. 몇 초 뒤 다시 시도해 주세요.',
      });
      return;
    }

    if (req.rawBody && req.rawBody.length > MAX_BODY_BYTES) {
      res.status(413).json({ ok: false, error: '요청 크기가 제한을 초과했습니다.' });
      return;
    }

    if (normalizedPath === '/api/report') {
      const result = handleReportRequest(req.body);
      res.status(result.status).json(result.payload);
      return;
    }

    if (normalizedPath === '/api/chart-summary') {
      const result = handleChartSummaryRequest(req.body);
      res.status(result.status).json(result.payload);
      return;
    }

    if (normalizedPath === '/api/relationship') {
      const result = handleRelationshipRequest(req.body);
      res.status(result.status).json(result.payload);
      return;
    }

    res.status(404).json({ ok: false, error: '존재하지 않는 API 경로입니다.' });
  }
);

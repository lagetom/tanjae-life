import {
  checkRateLimit,
  handleChartSummaryRequest,
  handleRelationshipRequest,
  handleReportRequest,
  resolveAllowedCorsOrigin,
  type ApiResult,
} from './apiHandlers.ts';

export interface PagesFunctionContext {
  request: Request;
  env: {
    ALLOWED_ORIGINS?: string;
  };
}

const MAX_BODY_BYTES = 32 * 1024;

export async function runCloudflarePostHandler(
  context: PagesFunctionContext,
  handler: (body: unknown) => ApiResult
): Promise<Response> {
  const { request, env } = context;
  const origin = request.headers.get('Origin');
  const allowedOrigin = resolveAllowedCorsOrigin(origin, env?.ALLOWED_ORIGINS);

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  };

  if (allowedOrigin) {
    baseHeaders['Access-Control-Allow-Origin'] = allowedOrigin;
    baseHeaders['Vary'] = 'Origin';
    baseHeaders['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    baseHeaders['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: baseHeaders });
  }

  const requestedWith = request.headers.get('X-Requested-With');
  if (requestedWith !== 'ChasaJaeClient' && !allowedOrigin) {
    return new Response(
      JSON.stringify({ ok: false, error: '허용되지 않은 요청 출처입니다.' }),
      { status: 403, headers: baseHeaders }
    );
  }

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
    'cf-edge';

  const rate = checkRateLimit(clientIp);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: '요청이 잠시 몰렸습니다. 몇 초 뒤 다시 시도해 주세요.',
      }),
      {
        status: 429,
        headers: {
          ...baseHeaders,
          'Retry-After': String(rate.retryAfterSec),
        },
      }
    );
  }

  const rawText = await request.text();
  if (rawText.length > MAX_BODY_BYTES) {
    return new Response(
      JSON.stringify({ ok: false, error: '요청 크기가 제한을 초과했습니다.' }),
      { status: 413, headers: baseHeaders }
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawText);
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: 'JSON 요청 형식이 올바르지 않습니다.' }),
      { status: 400, headers: baseHeaders }
    );
  }

  const result = handler(parsedBody);
  return new Response(JSON.stringify(result.payload), {
    status: result.status,
    headers: baseHeaders,
  });
}

export { handleReportRequest, handleChartSummaryRequest, handleRelationshipRequest };

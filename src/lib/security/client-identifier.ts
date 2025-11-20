import { NextRequest } from 'next/server';

/**
 * Get a unique identifier for rate limiting
 * Uses IP address or session ID
 */
export function getClientIdentifier(request: NextRequest, sessionId?: string): string {
  // Prefer session ID if available (for authenticated requests)
  if (sessionId) {
    return `session:${sessionId}`;
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

  return `ip:${ip}`;
}

import { NextResponse } from 'next/server'

/**
 * Health check endpoint for monitoring and load balancers
 * GET /api/health
 *
 * Returns 200 OK if the application is healthy
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  }

  return NextResponse.json(health, { status: 200 })
}

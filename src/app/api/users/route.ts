import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAllUsers } from '@/lib/auth/user-storage';
import { apiRateLimiter } from '@/lib/security/rate-limit';
import { getClientIdentifier } from '@/lib/security/client-identifier';

/**
 * GET /api/users
 * Get all users (without password hashes) - authenticated users only
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Apply rate limiting
    const identifier = getClientIdentifier(request, session.user.id);
    if (!apiRateLimiter.check(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const users = await getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

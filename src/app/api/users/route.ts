import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getAllUsers } from '@/lib/auth/user-storage';

/**
 * GET /api/users
 * Get all users (without password hashes) - authenticated users only
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getAllUsers();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

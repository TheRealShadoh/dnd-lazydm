import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getImageClientForUser } from '@/lib/ai/image-client';

/**
 * POST /api/ai/test/image
 * Test the image generation API connection for the current user
 */
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getImageClientForUser(session.user.id);

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'No image generation API configured' },
        { status: 400 }
      );
    }

    const result = await client.testConnection();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error testing image API connection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}

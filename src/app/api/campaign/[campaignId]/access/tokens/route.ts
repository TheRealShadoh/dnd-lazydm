import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { getPlayerTokens } from '@/lib/campaign/access-control';
import { apiRateLimiter } from '@/lib/security/rate-limit';
import { getClientIdentifier } from '@/lib/security/client-identifier';

/**
 * GET /api/campaign/[campaignId]/access/tokens?userId=xxx
 * Get assigned token IDs for a user in a campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
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

    const { campaignId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || session.user.id;

    // Get the user's assigned tokens
    const tokenIds = await getPlayerTokens(campaignId, userId);

    return NextResponse.json({ tokenIds });
  } catch (error) {
    console.error('Error getting user tokens:', error);
    return NextResponse.json(
      { error: 'Failed to get user tokens' },
      { status: 500 }
    );
  }
}

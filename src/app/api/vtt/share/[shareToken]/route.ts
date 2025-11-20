import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { findShareByToken } from '@/lib/vtt/share-storage';
import { hasAccess } from '@/lib/campaign/access-control';

/**
 * GET /api/vtt/share/[shareToken]
 * Get VTT share details and verify access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { shareToken: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareToken } = params;

    // Find the share
    const share = await findShareByToken(shareToken);

    if (!share) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }

    // Verify user has access to this campaign
    const userHasAccess = await hasAccess(share.campaignId, session.user.id);

    if (!userHasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this campaign' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      campaignId: share.campaignId,
      vttId: share.vttId,
      createdAt: share.createdAt,
    });
  } catch (error) {
    console.error('Error getting share details:', error);
    return NextResponse.json(
      { error: 'Failed to get share details' },
      { status: 500 }
    );
  }
}

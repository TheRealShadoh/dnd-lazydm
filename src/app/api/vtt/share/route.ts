import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { z } from 'zod';
import {
  createVTTShare,
  deactivateVTTShares,
  findActiveShareForVTT,
} from '@/lib/vtt/share-storage';
import { isDM, isOwner } from '@/lib/campaign/access-control';
import { apiRateLimiter } from '@/lib/security/rate-limit';
import { getClientIdentifier } from '@/lib/security/client-identifier';

const createShareSchema = z.object({
  campaignId: z.string().min(1),
  vttId: z.string().min(1),
});

const deleteShareSchema = z.object({
  campaignId: z.string().min(1),
  vttId: z.string().min(1),
});

/**
 * POST /api/vtt/share
 * Create a new VTT share link (DM only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const identifier = getClientIdentifier(request, session.user.id);
    if (!apiRateLimiter.check(identifier)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validationResult = createShareSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { campaignId, vttId } = validationResult.data;

    // Check if user is DM or owner
    const isOwnerCheck = await isOwner(campaignId, session.user.id);
    const isDMCheck = await isDM(campaignId, session.user.id);

    if (!isOwnerCheck && !isDMCheck) {
      return NextResponse.json(
        { error: 'Only DMs can create VTT shares' },
        { status: 403 }
      );
    }

    // Create the share
    const share = await createVTTShare(campaignId, vttId, session.user.id);

    return NextResponse.json({
      shareToken: share.shareToken,
      shareUrl: `/vtt/player/${share.shareToken}`,
    });
  } catch (error) {
    console.error('Error creating VTT share:', error);
    return NextResponse.json(
      { error: 'Failed to create share' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vtt/share
 * Deactivate VTT share (DM only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = deleteShareSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { campaignId, vttId } = validationResult.data;

    // Check if user is DM or owner
    const isOwnerCheck = await isOwner(campaignId, session.user.id);
    const isDMCheck = await isDM(campaignId, session.user.id);

    if (!isOwnerCheck && !isDMCheck) {
      return NextResponse.json(
        { error: 'Only DMs can deactivate VTT shares' },
        { status: 403 }
      );
    }

    // Deactivate shares
    await deactivateVTTShares(campaignId, vttId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deactivating VTT share:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate share' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vtt/share?campaignId=xxx&vttId=xxx
 * Get active share for a VTT (DM only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    const vttId = searchParams.get('vttId');

    if (!campaignId || !vttId) {
      return NextResponse.json(
        { error: 'campaignId and vttId are required' },
        { status: 400 }
      );
    }

    // Check if user is DM or owner
    const isOwnerCheck = await isOwner(campaignId, session.user.id);
    const isDMCheck = await isDM(campaignId, session.user.id);

    if (!isOwnerCheck && !isDMCheck) {
      return NextResponse.json(
        { error: 'Only DMs can view VTT shares' },
        { status: 403 }
      );
    }

    // Find active share
    const share = await findActiveShareForVTT(campaignId, vttId);

    if (!share) {
      return NextResponse.json({ share: null });
    }

    return NextResponse.json({
      share: {
        shareToken: share.shareToken,
        shareUrl: `/vtt/player/${share.shareToken}`,
        createdAt: share.createdAt,
      },
    });
  } catch (error) {
    console.error('Error getting VTT share:', error);
    return NextResponse.json(
      { error: 'Failed to get share' },
      { status: 500 }
    );
  }
}

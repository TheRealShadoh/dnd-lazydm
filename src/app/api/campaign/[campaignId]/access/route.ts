import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth-options';
import { z } from 'zod';
import {
  getCampaignAccess,
  updateCampaignAccess,
  isOwner,
  isDM,
} from '@/lib/campaign/access-control';
import { apiRateLimiter } from '@/lib/security/rate-limit';
import { getClientIdentifier } from '@/lib/security/client-identifier';

const addDMSchema = z.object({
  userId: z.string().min(1),
});

const removeDMSchema = z.object({
  userId: z.string().min(1),
});

const addPlayerSchema = z.object({
  userId: z.string().min(1),
  characterIds: z.array(z.string()).default([]),
});

const removePlayerSchema = z.object({
  userId: z.string().min(1),
});

const assignTokenSchema = z.object({
  userId: z.string().min(1),
  tokenId: z.string().min(1),
});

const unassignTokenSchema = z.object({
  userId: z.string().min(1),
  tokenId: z.string().min(1),
});

/**
 * GET /api/campaign/[campaignId]/access
 * Get campaign access control information
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

    const { campaignId } = await params;

    // Check if user is owner or DM
    const isOwnerCheck = await isOwner(campaignId, session.user.id);
    const isDMCheck = await isDM(campaignId, session.user.id);

    if (!isOwnerCheck && !isDMCheck) {
      return NextResponse.json(
        { error: 'Only campaign owners and DMs can view access control' },
        { status: 403 }
      );
    }

    const access = await getCampaignAccess(campaignId);

    if (!access) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json({ access });
  } catch (error) {
    console.error('Error getting campaign access:', error);
    return NextResponse.json(
      { error: 'Failed to get campaign access' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaign/[campaignId]/access
 * Manage campaign access (add DM, add player, assign token)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await auth();

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

    const { campaignId } = await params;

    // Check if user is owner or DM
    const isOwnerCheck = await isOwner(campaignId, session.user.id);
    const isDMCheck = await isDM(campaignId, session.user.id);

    if (!isOwnerCheck && !isDMCheck) {
      return NextResponse.json(
        { error: 'Only campaign owners and DMs can manage access' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action } = body;

    const access = await getCampaignAccess(campaignId);
    if (!access) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    switch (action) {
      case 'addDM': {
        const validation = addDMSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { userId } = validation.data;

        // Only owner can add DMs
        if (!isOwnerCheck) {
          return NextResponse.json(
            { error: 'Only the campaign owner can add DMs' },
            { status: 403 }
          );
        }

        if (!access.dmIds.includes(userId)) {
          access.dmIds.push(userId);
        }

        await updateCampaignAccess(campaignId, access);
        return NextResponse.json({ success: true, access });
      }

      case 'removeDM': {
        const validation = removeDMSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { userId } = validation.data;

        // Only owner can remove DMs
        if (!isOwnerCheck) {
          return NextResponse.json(
            { error: 'Only the campaign owner can remove DMs' },
            { status: 403 }
          );
        }

        access.dmIds = access.dmIds.filter((id) => id !== userId);
        await updateCampaignAccess(campaignId, access);
        return NextResponse.json({ success: true, access });
      }

      case 'addPlayer': {
        const validation = addPlayerSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { userId, characterIds } = validation.data;

        // Check if player already exists
        const existingPlayer = access.playerAssignments.find((p) => p.userId === userId);
        if (existingPlayer) {
          return NextResponse.json(
            { error: 'Player already assigned to campaign' },
            { status: 400 }
          );
        }

        access.playerAssignments.push({
          userId,
          characterIds,
          assignedTokenIds: [],
        });

        await updateCampaignAccess(campaignId, access);
        return NextResponse.json({ success: true, access });
      }

      case 'removePlayer': {
        const validation = removePlayerSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { userId } = validation.data;

        access.playerAssignments = access.playerAssignments.filter(
          (p) => p.userId !== userId
        );

        await updateCampaignAccess(campaignId, access);
        return NextResponse.json({ success: true, access });
      }

      case 'assignToken': {
        const validation = assignTokenSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { userId, tokenId } = validation.data;

        const player = access.playerAssignments.find((p) => p.userId === userId);
        if (!player) {
          return NextResponse.json(
            { error: 'Player not found in campaign' },
            { status: 404 }
          );
        }

        if (!player.assignedTokenIds.includes(tokenId)) {
          player.assignedTokenIds.push(tokenId);
        }

        await updateCampaignAccess(campaignId, access);
        return NextResponse.json({ success: true, access });
      }

      case 'unassignToken': {
        const validation = unassignTokenSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid input', details: validation.error.errors },
            { status: 400 }
          );
        }

        const { userId, tokenId } = validation.data;

        const player = access.playerAssignments.find((p) => p.userId === userId);
        if (!player) {
          return NextResponse.json(
            { error: 'Player not found in campaign' },
            { status: 404 }
          );
        }

        player.assignedTokenIds = player.assignedTokenIds.filter((id) => id !== tokenId);

        await updateCampaignAccess(campaignId, access);
        return NextResponse.json({ success: true, access });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing campaign access:', error);
    return NextResponse.json(
      { error: 'Failed to manage campaign access' },
      { status: 500 }
    );
  }
}

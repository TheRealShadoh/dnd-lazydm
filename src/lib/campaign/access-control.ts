import fs from 'fs/promises';
import path from 'path';

export interface PlayerAssignment {
  userId: string;
  characterIds: string[];
  assignedTokenIds: string[];
}

export interface CampaignAccess {
  ownerId: string;
  dmIds: string[];
  playerAssignments: PlayerAssignment[];
}

/**
 * Read campaign.json and extract access control data
 */
export async function getCampaignAccess(campaignId: string): Promise<CampaignAccess | null> {
  try {
    const campaignPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'campaign.json'
    );

    const data = await fs.readFile(campaignPath, 'utf-8');
    const campaign = JSON.parse(data);

    // Return access data or default structure
    return campaign.access || {
      ownerId: '',
      dmIds: [],
      playerAssignments: [],
    };
  } catch (error) {
    return null;
  }
}

/**
 * Update campaign access control
 */
export async function updateCampaignAccess(
  campaignId: string,
  access: CampaignAccess
): Promise<boolean> {
  try {
    const campaignPath = path.join(
      process.cwd(),
      'src',
      'app',
      'campaigns',
      campaignId,
      'campaign.json'
    );

    const data = await fs.readFile(campaignPath, 'utf-8');
    const campaign = JSON.parse(data);

    // Update access section
    campaign.access = access;

    await fs.writeFile(campaignPath, JSON.stringify(campaign, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error updating campaign access:', error);
    return false;
  }
}

/**
 * Check if user is campaign owner
 */
export async function isOwner(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  return access?.ownerId === userId;
}

/**
 * Check if user is a DM for the campaign
 */
export async function isDM(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  return access.ownerId === userId || access.dmIds.includes(userId);
}

/**
 * Check if user is a player in the campaign
 */
export async function isPlayer(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  return access.playerAssignments.some(p => p.userId === userId);
}

/**
 * Check if user has any access to the campaign
 */
export async function hasAccess(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  // Check if owner, DM, or player
  if (access.ownerId === userId) return true;
  if (access.dmIds.includes(userId)) return true;
  if (access.playerAssignments.some(p => p.userId === userId)) return true;

  return false;
}

/**
 * Get player's assigned characters
 */
export async function getPlayerCharacters(
  campaignId: string,
  userId: string
): Promise<string[]> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return [];

  const player = access.playerAssignments.find(p => p.userId === userId);
  return player?.characterIds || [];
}

/**
 * Get player's assigned tokens
 */
export async function getPlayerTokens(
  campaignId: string,
  userId: string
): Promise<string[]> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return [];

  const player = access.playerAssignments.find(p => p.userId === userId);
  return player?.assignedTokenIds || [];
}

/**
 * Add DM to campaign
 */
export async function addDM(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  if (!access.dmIds.includes(userId)) {
    access.dmIds.push(userId);
    return await updateCampaignAccess(campaignId, access);
  }

  return true;
}

/**
 * Remove DM from campaign
 */
export async function removeDM(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  access.dmIds = access.dmIds.filter(id => id !== userId);
  return await updateCampaignAccess(campaignId, access);
}

/**
 * Add player to campaign
 */
export async function addPlayer(
  campaignId: string,
  userId: string,
  characterIds: string[] = []
): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  // Check if player already exists
  const existingPlayer = access.playerAssignments.find(p => p.userId === userId);
  if (existingPlayer) {
    // Update character IDs
    existingPlayer.characterIds = [...new Set([...existingPlayer.characterIds, ...characterIds])];
  } else {
    // Add new player
    access.playerAssignments.push({
      userId,
      characterIds,
      assignedTokenIds: [],
    });
  }

  return await updateCampaignAccess(campaignId, access);
}

/**
 * Remove player from campaign
 */
export async function removePlayer(campaignId: string, userId: string): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  access.playerAssignments = access.playerAssignments.filter(p => p.userId !== userId);
  return await updateCampaignAccess(campaignId, access);
}

/**
 * Assign token to player
 */
export async function assignTokenToPlayer(
  campaignId: string,
  userId: string,
  tokenId: string
): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  const player = access.playerAssignments.find(p => p.userId === userId);
  if (!player) return false;

  if (!player.assignedTokenIds.includes(tokenId)) {
    player.assignedTokenIds.push(tokenId);
    return await updateCampaignAccess(campaignId, access);
  }

  return true;
}

/**
 * Unassign token from player
 */
export async function unassignTokenFromPlayer(
  campaignId: string,
  userId: string,
  tokenId: string
): Promise<boolean> {
  const access = await getCampaignAccess(campaignId);
  if (!access) return false;

  const player = access.playerAssignments.find(p => p.userId === userId);
  if (!player) return false;

  player.assignedTokenIds = player.assignedTokenIds.filter(id => id !== tokenId);
  return await updateCampaignAccess(campaignId, access);
}

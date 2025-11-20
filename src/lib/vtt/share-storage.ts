import fs from 'fs/promises';
import path from 'path';
import { nanoid } from 'nanoid';

export interface VTTShare {
  id: string;
  shareToken: string;
  campaignId: string;
  vttId: string;
  createdById: string;
  createdAt: string;
  isActive: boolean;
}

interface VTTSharesData {
  shares: VTTShare[];
}

const SHARES_FILE = path.join(process.cwd(), 'src', 'data', 'vtt-shares.json');

/**
 * Read VTT shares from JSON file
 */
async function readShares(): Promise<VTTSharesData> {
  try {
    const data = await fs.readFile(SHARES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty structure
    return { shares: [] };
  }
}

/**
 * Write VTT shares to JSON file
 */
async function writeShares(data: VTTSharesData): Promise<void> {
  await fs.writeFile(SHARES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Create a new VTT share
 */
export async function createVTTShare(
  campaignId: string,
  vttId: string,
  createdById: string
): Promise<VTTShare> {
  const data = await readShares();

  // Deactivate any existing shares for this VTT
  data.shares = data.shares.map(share => {
    if (share.campaignId === campaignId && share.vttId === vttId) {
      return { ...share, isActive: false };
    }
    return share;
  });

  // Create new share
  const share: VTTShare = {
    id: `share_${nanoid()}`,
    shareToken: nanoid(32),
    campaignId,
    vttId,
    createdById,
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  data.shares.push(share);
  await writeShares(data);

  return share;
}

/**
 * Find share by token
 */
export async function findShareByToken(shareToken: string): Promise<VTTShare | null> {
  const data = await readShares();
  return data.shares.find(s => s.shareToken === shareToken && s.isActive) || null;
}

/**
 * Find active share for a VTT
 */
export async function findActiveShareForVTT(
  campaignId: string,
  vttId: string
): Promise<VTTShare | null> {
  const data = await readShares();
  return data.shares.find(
    s => s.campaignId === campaignId && s.vttId === vttId && s.isActive
  ) || null;
}

/**
 * Get all active shares for a campaign
 */
export async function getActiveCampaignShares(campaignId: string): Promise<VTTShare[]> {
  const data = await readShares();
  return data.shares.filter(s => s.campaignId === campaignId && s.isActive);
}

/**
 * Deactivate a share
 */
export async function deactivateShare(shareToken: string): Promise<boolean> {
  const data = await readShares();
  const index = data.shares.findIndex(s => s.shareToken === shareToken);

  if (index === -1) {
    return false;
  }

  data.shares[index].isActive = false;
  await writeShares(data);
  return true;
}

/**
 * Deactivate all shares for a VTT
 */
export async function deactivateVTTShares(campaignId: string, vttId: string): Promise<void> {
  const data = await readShares();
  data.shares = data.shares.map(share => {
    if (share.campaignId === campaignId && share.vttId === vttId) {
      return { ...share, isActive: false };
    }
    return share;
  });
  await writeShares(data);
}

/**
 * Deactivate all shares for a campaign
 */
export async function deactivateCampaignShares(campaignId: string): Promise<void> {
  const data = await readShares();
  data.shares = data.shares.map(share => {
    if (share.campaignId === campaignId) {
      return { ...share, isActive: false };
    }
    return share;
  });
  await writeShares(data);
}

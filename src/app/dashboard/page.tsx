import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs/promises';
import path from 'path';
import { getCampaignAccess } from '@/lib/campaign/access-control';

interface CampaignMetadata {
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  access?: {
    ownerId: string;
    dmIds: string[];
    playerAssignments: Array<{
      userId: string;
      characterIds: string[];
      assignedTokenIds: string[];
    }>;
  };
}

async function getUserCampaigns(userId: string) {
  const campaignsDir = path.join(process.cwd(), 'src', 'app', 'campaigns');

  try {
    const entries = await fs.readdir(campaignsDir, { withFileTypes: true });
    const campaigns: Array<{ campaign: CampaignMetadata; role: string }> = [];

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('[')) {
        try {
          const campaignPath = path.join(campaignsDir, entry.name, 'campaign.json');
          const data = await fs.readFile(campaignPath, 'utf-8');
          const campaign: CampaignMetadata = JSON.parse(data);

          // Check user's role in this campaign
          const access = campaign.access;
          if (!access) continue;

          let role = '';
          if (access.ownerId === userId) {
            role = 'Owner';
          } else if (access.dmIds.includes(userId)) {
            role = 'DM';
          } else if (access.playerAssignments.some(p => p.userId === userId)) {
            role = 'Player';
          }

          if (role) {
            campaigns.push({ campaign, role });
          }
        } catch (error) {
          console.error(`Error reading campaign ${entry.name}:`, error);
        }
      }
    }

    return campaigns;
  } catch (error) {
    console.error('Error reading campaigns directory:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userCampaigns = await getUserCampaigns(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {session.user.name}!
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your campaigns and character assignments
          </p>
        </div>

        {userCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven&apos;t been assigned to any campaigns yet. Ask your DM to add you!
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCampaigns.map(({ campaign, role }) => (
              <Link
                key={campaign.slug}
                href={`/campaigns/${campaign.slug}`}
                className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {campaign.thumbnail && (
                  <div className="h-48 bg-gray-200 dark:bg-gray-700">
                    <img
                      src={campaign.thumbnail}
                      alt={campaign.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {campaign.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        role === 'Owner' || role === 'DM'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}
                    >
                      {role}
                    </span>
                  </div>
                  {campaign.description && (
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Campaign Admin
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse All Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}

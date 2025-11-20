'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
}

interface PlayerAssignment {
  userId: string;
  characterIds: string[];
  assignedTokenIds: string[];
}

interface CampaignAccess {
  ownerId: string;
  dmIds: string[];
  playerAssignments: PlayerAssignment[];
}

interface CampaignAccessManagerProps {
  campaignId: string;
}

export function CampaignAccessManager({ campaignId }: CampaignAccessManagerProps) {
  const { data: session } = useSession();
  const [access, setAccess] = useState<CampaignAccess | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch campaign access and all users
  useEffect(() => {
    async function fetchData() {
      try {
        const [accessRes, usersRes] = await Promise.all([
          fetch(`/api/campaign/${campaignId}/access`),
          fetch('/api/users'),
        ]);

        if (accessRes.ok) {
          const accessData = await accessRes.json();
          setAccess(accessData.access);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setAllUsers(usersData.users);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load campaign access data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [campaignId]);

  const handleAction = async (action: string, data: any) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/campaign/${campaignId}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Action failed');
        return;
      }

      setAccess(result.access);
      setSuccess('Action completed successfully');
      setSelectedUserId('');

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error performing action:', err);
      setError('Failed to perform action');
    }
  };

  const getUserInfo = (userId: string) => {
    return allUsers.find((u) => u.id === userId);
  };

  const availableUsers = allUsers.filter(
    (user) =>
      user.id !== access?.ownerId &&
      !access?.dmIds.includes(user.id) &&
      !access?.playerAssignments.some((p) => p.userId === user.id)
  );

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Campaign Access</h3>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!access) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-purple-400 mb-4">Campaign Access</h3>
        <p className="text-gray-400">No access configuration found.</p>
      </div>
    );
  }

  const isOwner = session?.user.id === access.ownerId;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-purple-400 mb-2">Campaign Access</h3>
        <p className="text-sm text-gray-400">Manage DMs and players for this campaign</p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900/20 border border-green-700 rounded text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Owner Section */}
      <div>
        <h4 className="font-semibold text-white mb-2">Campaign Owner</h4>
        <div className="p-3 bg-purple-900/20 border border-purple-700 rounded">
          <p className="text-purple-300">
            {getUserInfo(access.ownerId)?.name || 'Unknown'} (
            {getUserInfo(access.ownerId)?.email || access.ownerId})
          </p>
        </div>
      </div>

      {/* DMs Section */}
      <div>
        <h4 className="font-semibold text-white mb-2">Dungeon Masters</h4>

        {access.dmIds.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">No additional DMs assigned</p>
        ) : (
          <div className="space-y-2 mb-3">
            {access.dmIds.map((dmId) => {
              const user = getUserInfo(dmId);
              return (
                <div
                  key={dmId}
                  className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded"
                >
                  <div>
                    <p className="text-white font-medium">{user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-400">{user?.email || dmId}</p>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleAction('removeDM', { userId: dmId })}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isOwner && availableUsers.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="">Select user to add as DM...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedUserId) {
                  handleAction('addDM', { userId: selectedUserId });
                }
              }}
              disabled={!selectedUserId}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded transition"
            >
              Add DM
            </button>
          </div>
        )}
      </div>

      {/* Players Section */}
      <div>
        <h4 className="font-semibold text-white mb-2">Players</h4>

        {access.playerAssignments.length === 0 ? (
          <p className="text-sm text-gray-400 mb-3">No players assigned</p>
        ) : (
          <div className="space-y-2 mb-3">
            {access.playerAssignments.map((player) => {
              const user = getUserInfo(player.userId);
              return (
                <div
                  key={player.userId}
                  className="p-3 bg-gray-800 border border-gray-700 rounded"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-medium">{user?.name || 'Unknown'}</p>
                      <p className="text-sm text-gray-400">{user?.email || player.userId}</p>
                    </div>
                    <button
                      onClick={() =>
                        handleAction('removePlayer', { userId: player.userId })
                      }
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                    >
                      Remove
                    </button>
                  </div>

                  {player.assignedTokenIds.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Assigned Tokens:</p>
                      <div className="flex flex-wrap gap-1">
                        {player.assignedTokenIds.map((tokenId) => (
                          <span
                            key={tokenId}
                            className="px-2 py-1 bg-green-900/30 border border-green-700 text-green-400 text-xs rounded"
                          >
                            {tokenId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {availableUsers.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
            >
              <option value="">Select user to add as Player...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedUserId) {
                  handleAction('addPlayer', {
                    userId: selectedUserId,
                    characterIds: [],
                  });
                }
              }}
              disabled={!selectedUserId}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition"
            >
              Add Player
            </button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Note: Token assignments are managed in the VTT. Players can control tokens assigned
          to them by the DM.
        </p>
      </div>
    </div>
  );
}

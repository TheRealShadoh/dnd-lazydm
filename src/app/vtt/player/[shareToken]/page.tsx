'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { VTTCanvas } from '@/components/vtt/VTTCanvas';
import { InitiativeTracker } from '@/components/vtt/InitiativeTracker';
import { Token, GridSettings } from '@/types/vtt';

function PlayerVTTContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const shareToken = params.shareToken as string;

  const [shareData, setShareData] = useState<{
    campaignId: string;
    vttId: string;
    mapImageUrl: string;
  } | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [gridSettings, setGridSettings] = useState<GridSettings>({
    enabled: true,
    size: 50,
    snapToGrid: true,
  });
  const [canvasWidth, setCanvasWidth] = useState(1600);
  const [canvasHeight, setCanvasHeight] = useState(1200);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [userTokenIds, setUserTokenIds] = useState<string[]>([]);

  // Fetch share details and validate access
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    async function fetchShareDetails() {
      try {
        const response = await fetch(`/api/vtt/share/${shareToken}`);

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load shared VTT');
          return;
        }

        const data = await response.json();

        // Get the VTT state from local storage (DM's saved state)
        const savedStateKey = `vtt_state_${data.vttId}`;
        const savedState = localStorage.getItem(savedStateKey);

        if (savedState) {
          const state = JSON.parse(savedState);
          setShareData({
            campaignId: data.campaignId,
            vttId: data.vttId,
            mapImageUrl: state.mapImageUrl || '',
          });
          setTokens(state.tokens || []);
          setGridSettings(state.gridSettings || { enabled: true, size: 50, snapToGrid: true });
          if (state.canvasWidth) setCanvasWidth(state.canvasWidth);
          if (state.canvasHeight) setCanvasHeight(state.canvasHeight);
          if (state.scale) setScale(state.scale);
        } else {
          setError('VTT session not found');
        }

        // Fetch user's assigned tokens
        if (session) {
          try {
            const accessResponse = await fetch(
              `/api/campaign/${data.campaignId}/access/tokens?userId=${session.user.id}`
            );
            if (accessResponse.ok) {
              const accessData = await accessResponse.json();
              setUserTokenIds(accessData.tokenIds || []);
            }
          } catch (err) {
            console.error('Error fetching user token assignments:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching share details:', err);
        setError('Failed to load shared VTT');
      }
    }

    fetchShareDetails();
  }, [shareToken, session, status, router]);

  // Polling for updates from DM (every 3 seconds)
  useEffect(() => {
    if (!shareData) return;

    const interval = setInterval(() => {
      const savedStateKey = `vtt_state_${shareData.vttId}`;
      const savedState = localStorage.getItem(savedStateKey);

      if (savedState) {
        const state = JSON.parse(savedState);
        setTokens(state.tokens || []);
        setGridSettings(state.gridSettings || { enabled: true, size: 50, snapToGrid: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [shareData]);

  const handleUpdateToken = useCallback(
    (tokenId: string, updates: Partial<Token>) => {
      // Only allow updates to user's assigned tokens
      if (!userTokenIds.includes(tokenId)) {
        console.warn('Cannot update token - not assigned to you');
        return;
      }

      setTokens((prev) => {
        const updated = prev.map((t) => (t.id === tokenId ? { ...t, ...updates } : t));

        // Save to local storage so DM can see changes
        if (shareData) {
          const savedStateKey = `vtt_state_${shareData.vttId}`;
          const savedState = localStorage.getItem(savedStateKey);
          if (savedState) {
            const state = JSON.parse(savedState);
            state.tokens = updated;
            localStorage.setItem(savedStateKey, JSON.stringify(state));
          }
        }

        return updated;
      });
    },
    [userTokenIds, shareData]
  );

  const handleTokensChange = useCallback(
    (newTokens: Token[]) => {
      // Only allow changes if moving user's assigned tokens
      const changedToken = newTokens.find((newToken, index) => {
        const oldToken = tokens[index];
        return oldToken && (newToken.x !== oldToken.x || newToken.y !== oldToken.y);
      });

      if (changedToken && !userTokenIds.includes(changedToken.id)) {
        console.warn('Cannot move token - not assigned to you');
        return;
      }

      setTokens(newTokens);

      // Save to local storage
      if (shareData) {
        const savedStateKey = `vtt_state_${shareData.vttId}`;
        const savedState = localStorage.getItem(savedStateKey);
        if (savedState) {
          const state = JSON.parse(savedState);
          state.tokens = newTokens;
          localStorage.setItem(savedStateKey, JSON.stringify(state));
        }
      }
    },
    [tokens, userTokenIds, shareData]
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Access Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading shared VTT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-[2000px] mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">Player View - VTT</h1>
            <p className="text-sm text-gray-400 mt-1">
              View-only mode • You can control your assigned tokens
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Refresh
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* Canvas Area */}
          <div className="flex flex-col">
            <div className="overflow-auto border border-gray-700 rounded-lg bg-gray-900 p-4">
              <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <VTTCanvas
                  mapImageUrl={shareData.mapImageUrl}
                  tokens={tokens}
                  gridSettings={gridSettings}
                  onTokensChange={handleTokensChange}
                  selectedTokenId={selectedTokenId}
                  onTokenSelect={setSelectedTokenId}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  scale={scale}
                  userTokenIds={userTokenIds}
                />
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <h3 className="font-semibold text-purple-300 mb-2">Player Instructions</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• You can view all tokens on the map</li>
                <li>• You can only move tokens assigned to you (highlighted in green)</li>
                <li>• The map updates automatically from your DM</li>
                <li>• Refresh the page if you lose sync</li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto sticky top-4 pr-2
                          scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800">
            <InitiativeTracker
              tokens={tokens}
              onUpdateToken={handleUpdateToken}
              selectedTokenId={selectedTokenId}
              onTokenSelect={setSelectedTokenId}
              readOnly={true}
              userTokenIds={userTokenIds}
            />

            {/* Zoom Controls */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
              <h3 className="text-xl font-bold text-purple-400 mb-4">Zoom / Scale</h3>

              <div>
                <label htmlFor="scale" className="block text-sm text-gray-300 mb-2">
                  Scale: {Math.round(scale * 100)}%
                </label>
                <input
                  type="range"
                  id="scale"
                  min="0.25"
                  max="2"
                  step="0.05"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>25%</span>
                  <span>200%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setScale(0.5)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                >
                  50%
                </button>
                <button
                  onClick={() => setScale(1)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                >
                  100%
                </button>
                <button
                  onClick={() => setScale(1.5)}
                  className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition"
                >
                  150%
                </button>
              </div>
            </div>

            {/* Your Tokens */}
            {userTokenIds.length > 0 && (
              <div className="bg-gray-900 border border-green-700 rounded-lg p-4">
                <h3 className="text-xl font-bold text-green-400 mb-3">Your Tokens</h3>
                <ul className="space-y-2">
                  {tokens
                    .filter((t) => userTokenIds.includes(t.id))
                    .map((token) => (
                      <li
                        key={token.id}
                        className="p-2 bg-green-900/20 border border-green-700 rounded text-sm"
                      >
                        <div className="font-semibold text-green-300">{token.name}</div>
                        {token.label && (
                          <div className="text-xs text-gray-400">{token.label}</div>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlayerVTTPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading Player VTT...</p>
          </div>
        </div>
      }
    >
      <PlayerVTTContent />
    </Suspense>
  );
}

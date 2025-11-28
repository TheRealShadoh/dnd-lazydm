'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { VTTCanvas } from '@/components/vtt/VTTCanvas';
import { InitiativeTracker } from '@/components/vtt/InitiativeTracker';
import { Token, GridSettings } from '@/types/vtt';
import { MainNav } from '@/components/layout/MainNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Loader2, RefreshCw, LayoutDashboard, ZoomIn, Users, AlertCircle, Lightbulb } from 'lucide-react';

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-ui">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
          <Card variant="fantasy" className="max-w-md text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold font-display text-foreground mb-2">Access Error</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="primary" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-ui">Loading shared VTT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="max-w-[2000px] mx-auto p-4">
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display text-primary">Player View - VTT</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View-only mode - You can control your assigned tokens
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          {/* Canvas Area */}
          <div className="flex flex-col">
            <div className="overflow-auto border border-border rounded-lg bg-card p-4">
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
            <Card variant="fantasy" className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Player Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• You can view all tokens on the map</li>
                  <li>• You can only move tokens assigned to you (highlighted in green)</li>
                  <li>• The map updates automatically from your DM</li>
                  <li>• Refresh the page if you lose sync</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 max-h-[calc(100vh-140px)] overflow-y-auto sticky top-4 pr-2">
            <InitiativeTracker
              tokens={tokens}
              onUpdateToken={handleUpdateToken}
              selectedTokenId={selectedTokenId}
              onTokenSelect={setSelectedTokenId}
              readOnly={true}
              userTokenIds={userTokenIds}
            />

            {/* Zoom Controls */}
            <Card variant="fantasy">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ZoomIn className="h-5 w-5 text-primary" />
                  Zoom / Scale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scale">
                    Scale: {Math.round(scale * 100)}%
                  </Label>
                  <input
                    type="range"
                    id="scale"
                    min="0.25"
                    max="2"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>25%</span>
                    <span>200%</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScale(0.5)}
                  >
                    50%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScale(1)}
                  >
                    100%
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setScale(1.5)}
                  >
                    150%
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Your Tokens */}
            {userTokenIds.length > 0 && (
              <Card variant="fantasy" className="border-success/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <Users className="h-5 w-5" />
                    Your Tokens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tokens
                      .filter((t) => userTokenIds.includes(t.id))
                      .map((token) => (
                        <li
                          key={token.id}
                          className="p-3 bg-success/10 border border-success/30 rounded-lg text-sm"
                        >
                          <div className="font-semibold text-success">{token.name}</div>
                          {token.label && (
                            <div className="text-xs text-muted-foreground">{token.label}</div>
                          )}
                        </li>
                      ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PlayerVTTPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground font-ui">Loading Player VTT...</p>
          </div>
        </div>
      }
    >
      <PlayerVTTContent />
    </Suspense>
  );
}

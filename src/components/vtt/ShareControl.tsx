'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface ShareControlProps {
  campaignId: string;
  vttId: string;
}

export function ShareControl({ campaignId, vttId }: ShareControlProps) {
  const { data: session } = useSession();
  const [isShared, setIsShared] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Check if VTT is currently shared
  useEffect(() => {
    if (!session) return;

    async function checkShare() {
      try {
        const response = await fetch(
          `/api/vtt/share?campaignId=${campaignId}&vttId=${vttId}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.share) {
            setIsShared(true);
            setShareUrl(
              `${window.location.origin}${data.share.shareUrl}`
            );
          }
        }
      } catch (error) {
        console.error('Error checking share status:', error);
      }
    }

    checkShare();
  }, [session, campaignId, vttId]);

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vtt/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, vttId }),
      });

      if (response.ok) {
        const data = await response.json();
        const fullUrl = `${window.location.origin}${data.shareUrl}`;
        setShareUrl(fullUrl);
        setIsShared(true);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to share VTT');
      }
    } catch (error) {
      console.error('Error sharing VTT:', error);
      alert('Failed to share VTT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshare = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vtt/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, vttId }),
      });

      if (response.ok) {
        setIsShared(false);
        setShareUrl('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unshare VTT');
      }
    } catch (error) {
      console.error('Error unsharing VTT:', error);
      alert('Failed to unshare VTT');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Error copying URL:', error);
    }
  };

  if (!session) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <h3 className="text-xl font-bold text-purple-400 mb-3">Player Access</h3>

      {!isShared ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Share this VTT with your players so they can view and control their assigned tokens.
          </p>
          <button
            onClick={handleShare}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded transition"
          >
            {isLoading ? 'Sharing...' : 'Share with Players'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-green-900/20 border border-green-700 rounded">
            <p className="text-sm text-green-400 font-semibold mb-2">
              VTT is shared with players
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm text-gray-300 font-mono"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
              >
                {showCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Players with campaign access can use this link to view the VTT and control their assigned tokens.
          </p>
          <button
            onClick={handleUnshare}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded transition"
          >
            {isLoading ? 'Closing...' : 'Close Player Access'}
          </button>
        </div>
      )}
    </div>
  );
}

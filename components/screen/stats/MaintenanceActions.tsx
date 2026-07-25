'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { ThemedAlertModal } from '@/components/screen/modals/ThemedAlertModal';
import { ThemedPromptModal } from '@/components/screen/modals/ThemedPromptModal';

interface MaintenanceActionsProps {
  isAuthenticated: boolean;
  syncSecret: string;
}

export default function MaintenanceActions({
  isAuthenticated,
  syncSecret,
}: MaintenanceActionsProps) {
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [blockedAction, setBlockedAction] = useState('');

  // Target input modal state for Update Shows / Update Movies
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptType, setPromptType] = useState<'shows' | 'movies' | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      setIsLocalhost(host === 'localhost' || host === '127.0.0.1');
    }
  }, []);

  const triggerProductionAlert = (actionName: string) => {
    setBlockedAction(actionName);
    setModalOpen(true);
  };

  const handleOpenPrompt = (type: 'shows' | 'movies') => {
    if (!isLocalhost) {
      triggerProductionAlert(type === 'shows' ? 'Update Shows' : 'Update Movies');
      return;
    }
    setPromptType(type);
    setPromptOpen(true);
  };

  const handlePromptSubmit = (inputVal: string) => {
    if (!promptType) return;
    const trimmed = inputVal.trim();
    let endpoint = '';

    if (promptType === 'shows') {
      endpoint = trimmed
        ? `/api/screen/update/shows?tmdb_id=${encodeURIComponent(trimmed)}`
        : '/api/screen/update/shows?limit=1000';
    } else {
      endpoint = trimmed
        ? `/api/screen/update/movies?tmdb_id=${encodeURIComponent(trimmed)}`
        : '/api/screen/update/movies?limit=10000';
    }

    const href = `${endpoint}${endpoint.includes('?') ? '&' : '?'}secret=${encodeURIComponent(syncSecret)}`;
    setPromptOpen(false);
    window.location.href = href;
  };

  // Helper to render buttons conditionally:
  // - Localhost: renders as an anchor link pointing to the secret-protected API
  // - Production: renders as a button that pops up the security modal explanation
  const renderAction = (label: string, endpoint: string, hoverClass: string) => {
    if (isLocalhost) {
      const href = `${endpoint}${endpoint.includes('?') ? '&' : '?'}secret=${encodeURIComponent(syncSecret)}`;
      return (
        <Button asChild variant="glass" size="sm" className={`${hoverClass} text-quicksilver`}>
          <a href={href}>{label}</a>
        </Button>
      );
    }

    return (
      <Button
        variant="glass"
        size="sm"
        className={`${hoverClass} text-quicksilver`}
        onClick={() => triggerProductionAlert(label)}
      >
        {label}
      </Button>
    );
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="flex flex-col gap-2">
          {/* Top Row: Update Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="glass"
              size="sm"
              className="hover:text-gold hover:border-gold/50 text-quicksilver"
              onClick={() => handleOpenPrompt('shows')}
            >
              Update Shows
            </Button>

            <Button
              variant="glass"
              size="sm"
              className="hover:text-sapphire hover:border-sapphire/50 text-quicksilver"
              onClick={() => handleOpenPrompt('movies')}
            >
              Update Movies
            </Button>

            {renderAction(
              'Update from History',
              '/api/screen/enrich/history?limit=1000',
              'hover:text-amethyst hover:border-amethyst/50'
            )}
          </div>

          {/* Bottom Row: Enrich Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {renderAction(
              'Enrich People',
              '/api/screen/enrich/people?limit=1000',
              'hover:text-emerald hover:border-emerald/50'
            )}
            {renderAction(
              'Enrich Episodes',
              '/api/screen/enrich/episodes?limit=10000',
              'hover:text-topaz hover:border-topaz/50'
            )}
            {renderAction(
              'Enrich Seasons',
              '/api/screen/enrich/seasons?limit=10000',
              'hover:text-sapphire hover:border-sapphire/50'
            )}
            {renderAction(
              'Enrich Collections',
              '/api/screen/enrich/collections',
              'hover:text-ruby hover:border-ruby/50'
            )}

            <Button
              variant="glass"
              size="sm"
              className="hover:text-gold hover:border-gold/50 text-quicksilver/70"
              onClick={() => triggerProductionAlert('Test Action')}
            >
              Test Alert
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="glass"
            size="sm"
            className="hover:text-gold hover:border-gold/50 text-quicksilver/70"
            onClick={() => triggerProductionAlert('Test Action')}
          >
            Test Alert
          </Button>
        </div>
      )}

      {/* Reusable Themed Input Prompt Modal */}
      <ThemedPromptModal
        open={promptOpen}
        icon={promptType === 'shows' ? '📺' : '🎬'}
        title={promptType === 'shows' ? 'Update Shows' : 'Update Movies'}
        description={
          promptType === 'shows'
            ? 'Enter TMDB Show ID to update a single show, or leave blank for full run.'
            : 'Enter TMDB Movie ID to update a single movie, or leave blank for full run.'
        }
        inputLabel={promptType === 'shows' ? 'TMDB Show ID (Optional):' : 'TMDB Movie ID (Optional):'}
        inputPlaceholder={promptType === 'shows' ? 'e.g. 580' : 'e.g. 11'}
        submitText="Run Update"
        cancelText="Cancel"
        onSubmit={handlePromptSubmit}
        onCancel={() => setPromptOpen(false)}
      />

      {/* Reusable Themed Security Alert Modal */}
      <ThemedAlertModal
        open={modalOpen}
        icon="🔒"
        title="Access Denied"
        description={
          <>
            Action <span className="text-ruby font-semibold">"{blockedAction}"</span> is reserved
            for my use only. We wouldn't want you triggering a full sync and burning down my
            server, would we? 😉
            <br />
            <br />
            <span className="text-xs italic text-quicksilver bg-pearl/10 border border-border/10 rounded px-2 py-1 block mt-1">
              Security Info: The production API endpoints are protected by an environment-injected
              secret passphrase check.
            </span>
          </>
        }
        buttonText="Understood"
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

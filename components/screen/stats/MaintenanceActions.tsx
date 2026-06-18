'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';

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

  // Helper to render buttons conditionally:
  // - Localhost: renders as an anchor link pointing to the secret-protected API
  // - Production: renders as a button that pops up the security modal explanation
  const renderAction = (label: string, endpoint: string, hoverClass: string) => {
    if (isLocalhost) {
      // Append the secret query parameter for localhost execution
      const href = `${endpoint}${endpoint.includes('?') ? '&' : '?'}secret=${encodeURIComponent(syncSecret)}`;
      return (
        <Button asChild variant="glass" size="sm" className={`${hoverClass} text-quicksilver`}>
          <a href={href}>{label}</a>
        </Button>
      );
    }

    // In production, render as a button with no path info to hide endpoints from source code
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
        <div className="flex flex-wrap items-center gap-2">
          {renderAction(
            'Sync Latest',
            '/api/sync/latest',
            'hover:text-sapphire hover:border-sapphire/50'
          )}
          {renderAction(
            'Full Sync',
            '/api/sync/trakt?full=true',
            'hover:text-amethyst hover:border-amethyst/50'
          )}
          {renderAction(
            'Enrich People',
            '/api/enrich/people?limit=1000',
            'hover:text-emerald hover:border-emerald/50'
          )}
          {renderAction(
            'Enrich Episodes',
            '/api/enrich/episodes?limit=10000',
            'hover:text-topaz hover:border-topaz/50'
          )}
          {renderAction(
            'Enrich Collections',
            '/api/enrich/collections',
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
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {isLocalhost ? (
            <Button
              asChild
              variant="glass"
              size="sm"
              className="hover:text-gold hover:border-gold/50 text-quicksilver"
            >
              <a href={`/api/auth/trakt?secret=${encodeURIComponent(syncSecret)}`}>Connect Trakt</a>
            </Button>
          ) : (
            <Button
              variant="glass"
              size="sm"
              className="hover:text-gold hover:border-gold/50 text-quicksilver"
              onClick={() => triggerProductionAlert('Connect Trakt')}
            >
              Connect Trakt
            </Button>
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
      )}

      {/* Styled Theme Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full mx-4 overflow-hidden rounded-xl border border-border/15 bg-pearl/30 shadow-2xl backdrop-blur-xl p-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Background soft color blur */}
            <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-ruby/10 via-transparent to-transparent blur-xl pointer-events-none opacity-80" />

            {/* Icon */}
            <div className="relative w-12 h-12 rounded-full bg-ruby/10 border border-ruby/30 flex items-center justify-center text-ruby text-xl font-bold">
              🔒
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold tracking-tight text-accent relative z-10"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              Access Denied
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">
              Action <span className="text-ruby font-semibold">"{blockedAction}"</span> is reserved
              for my use only. We wouldn't want you triggering a full sync and burning down my
              server, would we? 😉
              <br />
              <br />
              <span className="text-xs italic text-quicksilver bg-pearl/10 border border-border/10 rounded px-2 py-1 block mt-1">
                Security Info: The production API endpoints are protected by an environment-injected
                secret passphrase check.
              </span>
            </p>

            {/* Close button */}
            <Button
              variant="glass"
              size="sm"
              className="w-full relative z-10 hover:text-ruby hover:border-ruby/50 text-quicksilver mt-2"
              onClick={() => setModalOpen(false)}
            >
              Understood
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

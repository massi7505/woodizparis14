'use client';

import Image from 'next/image';

interface Props {
  settings: any;
  site?: any;
}

export default function LinktreeCover({ settings, site }: Props) {
  if (!settings) return null;

  const name = settings?.profileName || site?.siteName || '';
  const subtitle = settings?.profileSubtitle || site?.siteSlogan || '';

  const hasMedia =
    (settings.coverType === 'video' && settings.coverVideoUrl) ||
    (settings.coverType === 'image' && settings.coverImageUrl);

  const renderMedia = () => {
    if (settings.coverType === 'video' && settings.coverVideoUrl) {
      return (
        <video
          src={settings.coverVideoUrl}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }
    if (settings.coverType === 'image' && settings.coverImageUrl) {
      return (
        <Image
          src={settings.coverImageUrl}
          alt="Cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px"
          className="object-cover"
          priority
        />
      );
    }
    if (settings.coverType === 'color') {
      return (
        <div
          className="absolute inset-0"
          style={{ background: settings.coverColor || '#1F2937' }}
        />
      );
    }
    return null;
  };

  return (
    <div className="relative w-full" style={{ height: '240px' }}>
      {/* Media layer */}
      {renderMedia()}

      {/* Gradient overlays */}
      {hasMedia && (
        <>
          {/* Dark vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
          {/* Bottom fade matching page bg */}
          <div
            className="absolute bottom-0 left-0 right-0 h-28"
            style={{
              background: `linear-gradient(to bottom, transparent, ${settings.bgColor || '#111827'})`,
            }}
          />
        </>
      )}

      {/* Profile avatar — centered at bottom edge */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
        {settings.profileImageUrl ? (
          <div className="relative w-24 h-24">
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-full blur-md opacity-60 scale-110"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
            />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-white/20 shadow-2xl">
              <Image src={settings.profileImageUrl} alt={name} fill sizes="96px" className="object-cover" />
            </div>
          </div>
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl border-[3px] border-white/20"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
          >
            {(name[0] || 'W').toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}

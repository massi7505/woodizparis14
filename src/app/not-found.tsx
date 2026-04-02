import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#0C0A09' }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 600px 400px at 50% 40%, rgba(232,101,10,0.08), transparent)',
        }}
      />

      <div className="relative z-10 text-center max-w-md">
        {/* Logo badge */}
        <div className="flex justify-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #E8650A, #C9550A)' }}
          >
            W
          </div>
        </div>

        {/* 404 */}
        <p
          className="text-8xl font-black mb-2 leading-none"
          style={{
            background: 'linear-gradient(135deg, #E8650A, #F59E0B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </p>

        <h1 className="text-2xl font-bold text-white mb-3">Page introuvable</h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          Oups ! Cette page n'existe pas ou a été déplacée.<br />
          Revenez à l'accueil pour continuer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #E8650A, #C9550A)' }}
          >
            ← Retour à l'accueil
          </Link>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#D0D0D0',
            }}
          >
            Voir la carte
          </Link>
        </div>
      </div>
    </div>
  );
}

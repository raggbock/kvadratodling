import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Kvadratodling — planera din pallkrage';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Site-wide default OG image. Next auto-attaches this to any route that
// doesn't ship a more specific opengraph-image. Generated on demand and
// cached at the edge — no static PNG to maintain.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px 96px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative pallkrage grid in the top-right corner */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 80,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 80px)',
            gridTemplateRows: 'repeat(4, 80px)',
            gap: 8,
            opacity: 0.55,
          }}
        >
          {Array.from({ length: 16 }, (_, i) => {
            const emojis = ['🍅', '🥬', '🥕', '🌿', '🌱', '🥒', '🌶️', '🧅'];
            const e = emojis[i % emojis.length];
            return (
              <div
                key={i}
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  borderRadius: 12,
                  border: '2px solid #86efac',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                }}
              >
                {e}
              </div>
            );
          })}
        </div>

        {/* Top: small brand badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#15803d',
          }}
        >
          <span style={{ fontSize: 36 }}>🌱</span>
          <span>Kvadratodling</span>
        </div>

        {/* Bottom: tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: '#14532d',
            }}
          >
            Planera din pallkrage —
            <br />
            kvadrat för kvadrat.
          </div>
          <div style={{ fontSize: 30, color: '#166534', lineHeight: 1.3 }}>
            108 växter · sällskapsplantering · odlingsschema för svenska zoner
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

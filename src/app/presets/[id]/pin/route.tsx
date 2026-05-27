import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';
import { PRESETS, applyPreset } from '@/lib/presets';
import { createClient } from '@/utils/supabase/server';

// Pinterest-friendly portrait image per preset. 1000×1500 (2:3 ratio).
// Pinterest's algorithm strongly favours this aspect ratio. Generated on
// demand and edge-cached by Vercel.
//
// Use this in og:image when sharing /catalog or /presets pages, and embed
// directly via <img src="/presets/<id>/pin"> for Pinterest pinning.

export const runtime = 'nodejs';
export const revalidate = 86400;

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  const preset = PRESETS.find((p) => p.id === id);
  if (!preset) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Use a representative 4×4 grid for the pin visual. We don't care about the
  // user's actual bed dimensions here — this is marketing material.
  const slots = applyPreset(4, 4, preset);
  const slotBySlug = new Map<string, string>();
  for (const s of slots) slotBySlug.set(`${s.row}:${s.col}`, s.slug);

  // Resolve slugs → emojis for the grid
  const supabase = await createClient();
  const slugs = Array.from(new Set(slots.map((s) => s.slug)));
  const { data: plants } = await supabase
    .from('plants')
    .select('slug, common_name, emoji, plants_per_sqft')
    .in('slug', slugs);
  const plantBySlug = new Map((plants ?? []).map((p) => [p.slug, p]));

  // Breakdown for bottom list
  const counts = new Map<string, number>();
  for (const s of slots) counts.set(s.slug, (counts.get(s.slug) ?? 0) + 1);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 100%)',
          fontFamily: 'sans-serif',
          padding: 0,
        }}
      >
        {/* Top header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 80,
            paddingBottom: 30,
            gap: 16,
          }}
        >
          <div style={{ fontSize: 28, color: '#15803d', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            Pallkrage-preset
          </div>
          <div style={{ fontSize: 110, lineHeight: 1 }}>{preset.emoji}</div>
          <div style={{ fontSize: 78, fontWeight: 800, color: '#14532d', letterSpacing: '-0.02em', textAlign: 'center', maxWidth: 880 }}>
            {preset.name}
          </div>
        </div>

        {/* Grid visual */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 150px)',
              gridTemplateRows: 'repeat(4, 150px)',
              gap: 10,
              background: '#fff',
              padding: 24,
              borderRadius: 24,
              border: '4px solid #16a34a',
              boxShadow: '0 10px 30px rgba(20, 83, 45, 0.15)',
            }}
          >
            {Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 4 }, (_, c) => {
                const slug = slotBySlug.get(`${r}:${c}`);
                const plant = slug ? plantBySlug.get(slug) : null;
                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      background: '#f0fdf4',
                      border: '2px solid #86efac',
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 80,
                    }}
                  >
                    {plant?.emoji ?? ''}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Plant breakdown */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '30px 80px 0',
            gap: 8,
          }}
        >
          <div style={{ fontSize: 24, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Det här ingår
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
            {Array.from(counts.entries()).map(([slug, count]) => {
              const plant = plantBySlug.get(slug);
              if (!plant) return null;
              const total = plant.plants_per_sqft >= 1 ? count * Number(plant.plants_per_sqft) : count;
              return (
                <div
                  key={slug}
                  style={{
                    background: '#fff',
                    border: '2px solid #bbf7d0',
                    borderRadius: 999,
                    padding: '8px 18px',
                    fontSize: 26,
                    color: '#14532d',
                    fontWeight: 600,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 30 }}>{plant.emoji}</span>
                  <span>{plant.common_name}</span>
                  <span style={{ color: '#15803d', fontWeight: 500 }}>
                    ·{' '}
                    {plant.plants_per_sqft >= 2 ? `${count} rutor (${total} st)` : `${count} rutor`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spacer + footer */}
        <div style={{ display: 'flex', flexGrow: 1 }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            padding: '20px 0 50px',
          }}
        >
          <span style={{ fontSize: 44 }}>🌱</span>
          <span style={{ fontSize: 36, fontWeight: 700, color: '#15803d', letterSpacing: '0.02em' }}>
            kvadratodling.se
          </span>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 1500,
    },
  );
}

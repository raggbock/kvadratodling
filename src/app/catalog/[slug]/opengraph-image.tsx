import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

// Per-plant OG image. We use the Node runtime here because the edge runtime
// can't use the SSR Supabase client (cookies). Each image is generated on
// first request and cached — there are only 108 plants, so the cost is bounded.
export const runtime = 'nodejs';
export const alt = 'Växtkort — Kvadratodling';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SUN_LABELS: Record<string, string> = {
  full_sun: 'Fullt soligt',
  part_shade: 'Halvskugga',
  full_shade: 'Skugga',
};
const WATER_LABELS: Record<string, string> = {
  low: 'Lågt',
  medium: 'Medel',
  high: 'Högt',
};

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: plant } = await supabase
    .from('plants')
    .select(
      'common_name, english_name, emoji, plants_per_sqft, sun_requirement, water_need, days_to_maturity_min, days_to_maturity_max, zones_min, zones_max',
    )
    .eq('slug', params.slug)
    .single();

  if (!plant) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#f0fdf4', fontSize: 60, color: '#14532d',
          }}
        >
          Kvadratodling
        </div>
      ),
      { ...size },
    );
  }

  const facts: { label: string; value: string }[] = [
    { label: 'Per ruta', value: `${plant.plants_per_sqft} st` },
    { label: 'Sol', value: SUN_LABELS[plant.sun_requirement] ?? '' },
    { label: 'Vatten', value: WATER_LABELS[plant.water_need] ?? '' },
  ];
  if (plant.days_to_maturity_min) {
    const max = plant.days_to_maturity_max;
    facts.push({
      label: 'Skörd',
      value: max && max !== plant.days_to_maturity_min
        ? `${plant.days_to_maturity_min}–${max} d`
        : `${plant.days_to_maturity_min} d`,
    });
  }
  if (plant.zones_min) {
    facts.push({
      label: 'Zoner',
      value: plant.zones_max && plant.zones_max !== plant.zones_min
        ? `${plant.zones_min}–${plant.zones_max}`
        : plant.zones_min,
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          padding: '80px 96px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          fontFamily: 'sans-serif',
          alignItems: 'center',
          gap: 80,
        }}
      >
        {/* Left: big emoji on a "ruta" */}
        <div
          style={{
            width: 360,
            height: 360,
            background: '#ffffff',
            border: '4px solid #16a34a',
            borderRadius: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 260,
            flexShrink: 0,
          }}
        >
          {plant.emoji}
        </div>

        {/* Right: name + facts + brand */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                lineHeight: 1,
                color: '#14532d',
                letterSpacing: '-0.02em',
              }}
            >
              {plant.common_name}
            </div>
            {plant.english_name && (
              <div style={{ fontSize: 28, color: '#15803d', opacity: 0.7 }}>
                {plant.english_name}
              </div>
            )}
          </div>

          {/* Facts in a 2-column grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px 32px',
              marginTop: 8,
            }}
          >
            {facts.map((f) => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 18, color: '#166534', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {f.label}
                </div>
                <div style={{ fontSize: 32, color: '#14532d', fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>

          {/* Brand footer */}
          <div
            style={{
              marginTop: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 22,
              color: '#15803d',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 30 }}>🌱</span>
            <span>Kvadratodling</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

export default function Home() {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo-grodden.svg`,
    description: SITE_DESCRIPTION,
  };
  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'sv-SE',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/catalog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div>
      <JsonLd data={[orgSchema, siteSchema]} />
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 pb-20 pt-20 text-center sm:pt-28"
        style={{ background: 'var(--color-surface-page)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, var(--color-brand-subtle), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-2xl">
          <p
            className="mb-4 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}
          >
            <Image src="/assets/icon-sprout.svg" alt="" width={12} height={12} className="opacity-60" />
            För hobbyodlare i pallkragar &amp; balkonglådor
          </p>
          <h1
            className="mb-5 text-5xl leading-tight sm:text-6xl"
            style={{
              fontFamily: 'var(--font-family-display)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--color-text-default)',
            }}
          >
            Planera din pallkrage —<br />kvadrat för kvadrat.
          </h1>
          <p
            className="mx-auto mb-9 max-w-lg text-lg leading-relaxed"
            style={{ color: 'var(--color-text-subtle)' }}
          >
            Hjälper dig välja vad, när och hur du odlar med kvadratmetoden.
            25 växter, sällskapsplantering och ett odlingsschema som följer din sista frost.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/gardens"
              className="rounded-xl px-6 py-3 text-base font-semibold shadow-md transition"
              style={{
                background: 'var(--color-brand-default)',
                color: 'var(--color-text-inverse)',
              }}
            >
              Skapa din första odling
            </Link>
            <Link
              href="/catalog"
              className="rounded-xl border px-6 py-3 text-base font-medium transition"
              style={{
                borderColor: 'var(--color-border-default)',
                background: 'var(--color-surface-default)',
                color: 'var(--color-text-default)',
              }}
            >
              Bläddra bland växter
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              illus: '/assets/illus-grodd.svg',
              title: 'Designa pallkragen',
              body: 'Välj storlek — 4×4, 4×8 eller eget mått. Varje ruta visar exakt hur många plantor som får plats.',
            },
            {
              illus: '/assets/illus-morot.svg',
              title: '25 växter att välja mellan',
              body: 'Tomat, sallad, morot, ärt och fler. Klicka i en ruta för att plantera, klicka igen för att tömma.',
            },
            {
              illus: '/assets/illus-tomat.svg',
              title: 'Goda och dåliga grannar',
              body: 'Se vilka växter som trivs ihop och vilka som konkurrerar — planera för en friskare skörd.',
            },
          ].map(({ illus, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border p-6 shadow-sm"
              style={{
                background: 'var(--color-surface-default)',
                borderColor: 'var(--color-border-subtle)',
              }}
            >
              <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ background: 'var(--color-surface-subtle)' }}
              >
                <Image src={illus} alt="" width={40} height={40} />
              </div>
              <h3
                className="mb-1.5 text-lg"
                style={{
                  fontFamily: 'var(--font-family-display)',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  color: 'var(--color-text-default)',
                }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-subtle)' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule teaser */}
      <section
        className="mx-auto mb-20 max-w-5xl rounded-2xl border px-8 py-10 sm:px-10"
        style={{
          background: 'var(--color-surface-default)',
          borderColor: 'var(--color-border-subtle)',
          marginLeft: '1rem',
          marginRight: '1rem',
        }}
      >
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase"
              style={{ color: 'var(--color-status-positive)', letterSpacing: '0.08em' }}
            >
              Odlingsschemat
            </p>
            <h2
              className="mb-3 text-3xl leading-tight"
              style={{
                fontFamily: 'var(--font-family-display)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                color: 'var(--color-text-default)',
              }}
            >
              Sätt sista frost — så vet du när.
            </h2>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: 'var(--color-text-subtle)' }}>
              Sverige delas in i odlingszoner. När du anger sista frost för din plats räknar vi ut
              när du ska så inomhus, plantera ut och skörda — för varje växt i din pallkrage.
            </p>
            <Link
              href="/gardens/new"
              className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-2"
              style={{ color: 'var(--color-text-link)' }}
            >
              Kom igång
              <Image src="/assets/icon-arrow-right.svg" alt="" width={14} height={14} />
            </Link>
          </div>
          {/* Mini bed preview */}
          <div
            className="grid grid-cols-4 gap-1.5 rounded-xl p-3"
            style={{ background: 'var(--color-brand-default)' }}
          >
            {Array.from({ length: 16 }, (_, i) => {
              const illustMap: Record<number, string> = {
                0: '/assets/illus-tomat.svg',
                1: '/assets/illus-sallad.svg',
                4: '/assets/illus-morot.svg',
                5: '/assets/illus-bona.svg',
                8: '/assets/illus-tomat.svg',
                11: '/assets/illus-sallad.svg',
                12: '/assets/illus-morot.svg',
              };
              const illus = illustMap[i];
              return (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded"
                  style={{ background: 'var(--color-surface-subtle)' }}
                >
                  {illus && <Image src={illus} alt="" width={28} height={28} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

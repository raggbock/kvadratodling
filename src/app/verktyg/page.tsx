import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Verktyg för svenska odlare',
  description: 'Gratis verktyg för pallkrage-odling: frostkalkylator, odlingsschema per zon, växtkatalog.',
  alternates: { canonical: '/verktyg' },
};

const TOOLS = [
  {
    href: '/verktyg/frostkalkylator',
    emoji: '❄️',
    title: 'Frostkalkylator',
    description: 'Hitta sista frost för din ort. Klicka regionen på kartan eller välj från listan.',
  },
  {
    href: '/odlingsschema',
    emoji: '📅',
    title: 'Odlingsschema per zon',
    description: 'Komplett sådd- och skördeschema för Sveriges 8 zoner — 108 växter.',
  },
  {
    href: '/catalog',
    emoji: '🌱',
    title: 'Växtkatalog',
    description: 'Bläddra bland 108 växter med plantering per ruta, sol, vatten, sällskap.',
  },
  {
    href: '/gardens/new',
    emoji: '🛏',
    title: 'Pallkrage-planeraren',
    description: 'Designa din pallkrage kvadrat för kvadrat med automatisk layout och presets.',
  },
];

export default function VerktygPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600">Verktyg</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Gratis verktyg för odlare
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-gray-600">
          Alla verktyg är gratis och kräver inget konto. Bara välj och börja använda.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-green-300 hover:shadow-md"
          >
            <div className="text-3xl">{t.emoji}</div>
            <h2 className="mt-2 text-lg font-semibold text-gray-900">{t.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

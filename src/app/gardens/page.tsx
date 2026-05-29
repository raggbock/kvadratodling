import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export const metadata = { title: 'Mina odlingar | Kvadratodling' };

export default async function GardensPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: gardens } = await supabase
    .from('gardens')
    .select('id, name, description, created_at, beds(id)')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-default">Mina odlingar</h1>
        <Link
          href="/gardens/new"
          className="rounded-md bg-brand-default px-4 py-2 text-sm font-semibold text-white hover:bg-brand-emphasis"
        >
          + Ny odling
        </Link>
      </div>

      {!gardens || gardens.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-border-default bg-surface-default py-16 text-center">
          <div className="mb-3 text-4xl">🪴</div>
          <h2 className="mb-1 font-semibold text-text-default">Inga odlingar än</h2>
          <p className="mb-4 text-sm text-text-subtle">Skapa din första odling för att komma igång.</p>
          <Link
            href="/gardens/new"
            className="rounded-md bg-brand-default px-4 py-2 text-sm font-semibold text-white hover:bg-brand-emphasis"
          >
            Skapa en odling
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gardens.map((g) => (
            <Link
              key={g.id}
              href={`/gardens/${g.id}`}
              className="rounded-xl border border-border-default bg-surface-default p-5 shadow-sm transition hover:border-brand-subtle hover:shadow-md"
            >
              <div className="mb-3 text-2xl">🌿</div>
              <h2 className="font-semibold text-text-default">{g.name}</h2>
              {g.description && (
                <p className="mt-1 text-sm text-text-subtle line-clamp-2">{g.description}</p>
              )}
              <p className="mt-3 text-xs text-text-muted">
                {g.beds.length} {g.beds.length === 1 ? 'odlingslåda' : 'odlingslådor'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

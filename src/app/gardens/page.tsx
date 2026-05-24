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
        <h1 className="text-2xl font-bold text-gray-900">Mina odlingar</h1>
        <Link
          href="/gardens/new"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
        >
          + Ny odling
        </Link>
      </div>

      {!gardens || gardens.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-16 text-center">
          <div className="mb-3 text-4xl">🪴</div>
          <h2 className="mb-1 font-semibold text-gray-700">Inga odlingar än</h2>
          <p className="mb-4 text-sm text-gray-500">Skapa din första odling för att komma igång.</p>
          <Link
            href="/gardens/new"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
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
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
            >
              <div className="mb-3 text-2xl">🌿</div>
              <h2 className="font-semibold text-gray-900">{g.name}</h2>
              {g.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{g.description}</p>
              )}
              <p className="mt-3 text-xs text-gray-400">
                {g.beds.length} {g.beds.length === 1 ? 'odlingslåda' : 'odlingslådor'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

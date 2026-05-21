import Link from 'next/link';
import { SignInButton, Show } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mb-6 text-7xl">🌱</div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Square-foot garden planner
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
        Design your beds, place plants, and get companion-planting hints — all in one place.
        Built for hobby gardeners with small plots.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700">
              Get started — it&apos;s free
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <Link
            href="/gardens"
            className="rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-green-700"
          >
            My gardens →
          </Link>
        </Show>
        <Link
          href="/catalog"
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Browse plant catalog
        </Link>
      </div>
      <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
        {[
          { icon: '📐', title: 'Design your beds', body: 'Choose any size — 4×4 ft, 4×8 ft, or custom. Each square holds exactly the right number of plants.' },
          { icon: '🌿', title: 'Place 25+ plants', body: 'Pick from tomatoes, lettuce, carrots and more. Click a square to plant. Click again to clear.' },
          { icon: '🤝', title: 'Companion hints', body: 'See which neighbors help or hurt each other, so you can plan a healthier, higher-yield bed.' },
        ].map(({ icon, title, body }) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-3xl">{icon}</div>
            <h3 className="mb-1 font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

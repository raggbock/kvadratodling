import Link from 'next/link';

/**
 * One companion / antagonist pairing on the plant detail page, rendered as a
 * compact chip that links to the other plant. The reason (notes) is exposed as
 * a hover tooltip rather than inline, so many pairings stay a couple of wrapped
 * rows instead of a tall column — the detailed tips also surface in the planner.
 * Takes the other plant's display data directly — no slug lookup, so the
 * component is decoupled from any client-side plant catalog.
 */
interface Props {
  kind: 'good' | 'bad';
  other: { slug: string; common_name: string; emoji: string };
  notes: string | null;
}

export function CompanionHint({ kind, other, notes }: Props) {
  const isGood = kind === 'good';
  return (
    <Link
      href={`/catalog/${other.slug}`}
      title={notes ?? undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition hover:opacity-80 ${
        isGood
          ? 'border-status-positive bg-status-positive-subtle text-status-positive'
          : 'border-status-negative bg-status-negative-subtle text-status-negative'
      }`}
    >
      <span aria-hidden>{other.emoji}</span>
      <span className="font-medium">{other.common_name}</span>
    </Link>
  );
}

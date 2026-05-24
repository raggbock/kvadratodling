/**
 * Renders one companion / antagonist pairing on the plant detail page.
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
    <div
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${
        isGood
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}
    >
      <span className="mt-0.5 shrink-0 text-base">{isGood ? '✅' : '⚠️'}</span>
      <div className="min-w-0">
        <span className="font-medium">
          {other.emoji} {other.common_name}
        </span>
        {notes && (
          <>
            {' — '}
            <span>{notes}</span>
          </>
        )}
      </div>
    </div>
  );
}

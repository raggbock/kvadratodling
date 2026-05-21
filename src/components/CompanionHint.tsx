import type { CompanionHint as CompanionHintType } from '@/lib/companion-planting';
import { getPlant } from '@/lib/plants';

interface Props {
  hint: CompanionHintType;
}

export function CompanionHint({ hint }: Props) {
  const other = getPlant(hint.otherPlantSlug);
  const isGood = hint.kind === 'good';

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
          {other ? `${other.emoji} ${other.name}` : hint.otherPlantSlug}
        </span>
        {' — '}
        <span>{hint.reason}</span>
      </div>
    </div>
  );
}

/**
 * Inline badge version used in the grid placement UI.
 * Shows a small indicator (no full description).
 */
export function CompanionHintBadge({ hint }: Props) {
  const other = getPlant(hint.otherPlantSlug);
  const isGood = hint.kind === 'good';

  return (
    <span
      title={hint.reason}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isGood
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      {isGood ? '✅' : '⚠️'}
      {other ? other.name : hint.otherPlantSlug}
    </span>
  );
}

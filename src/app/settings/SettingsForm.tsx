'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { track } from '@/lib/analytics';

interface Props {
  email: string;
  digestEnabled: boolean;
  lastSentAt: string | null;
}

export function SettingsForm({ email, digestEnabled: initial, lastSentAt }: Props) {
  const [enabled, setEnabled] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function toggle() {
    const next = !enabled;
    setEnabled(next);
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('users')
      .update({ weekly_digest_enabled: next })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      // Revert on failure
      setEnabled(!next);
      return;
    }
    setSavedAt(Date.now());
    if (!next) track({ name: 'digest_unsubscribed' });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="text-xs uppercase tracking-wide text-gray-400">E-post</p>
        <p className="mt-1 text-sm font-medium text-gray-900">{email}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Veckotips på söndagar</h2>
            <p className="mt-1 text-sm text-gray-500">
              Få ett kort mail med vad du behöver göra i odlingen den närmaste veckan —
              så inomhus, plantera ut, börja skörda. Inga mail när det inte finns något att göra.
            </p>
            {lastSentAt && (
              <p className="mt-2 text-xs text-gray-400">
                Senast skickat: {new Date(lastSentAt).toLocaleDateString('sv-SE')}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={toggle}
            disabled={saving}
            role="switch"
            aria-checked={enabled}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50 ${
              enabled ? 'bg-green-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {savedAt && (
          <p className="mt-3 text-xs text-green-700">
            Sparat ✓
          </p>
        )}
      </div>
    </div>
  );
}

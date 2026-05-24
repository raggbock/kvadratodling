import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Unified API error handler. Maps caught errors to the right HTTP response
 * and logs the unexpected ones so we don't lose them.
 *
 * The route-level pattern used to be `catch (err) { return 401 }`, which
 * masked DB constraint violations, GRANT/RLS issues and network glitches
 * as "Unauthorized" — wasted hours during the early-production GRANT bug.
 *
 *   ZodError                      → 400 with field details
 *   Error("Unauthorized")          → 401 (re-thrown from requireUser)
 *   anything else                  → 500 + console.error
 */
export function apiError(err: unknown, route: string): NextResponse {
  if (err instanceof z.ZodError) {
    return NextResponse.json({ error: err.flatten() }, { status: 400 });
  }
  if (err instanceof Error && err.message === 'Unauthorized') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.error(`[${route}]`, err);
  return NextResponse.json({ error: 'Internal error' }, { status: 500 });
}

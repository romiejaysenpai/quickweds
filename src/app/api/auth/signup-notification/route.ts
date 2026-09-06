import { NextResponse, type NextRequest } from 'next/server';
import { getRequestUser } from '@/lib/api-auth';
import { createRateLimitMiddleware, getClientIP } from '@/lib/rate-limit';
import { sendVerifiedSignupNotifications } from '@/lib/signup-notifications';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { user, error } = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 });

  const rateLimit = createRateLimitMiddleware('SIGNUP_NOTIFY');
  const limited = await rateLimit.check(`${user.id}:${getClientIP(req)}`);
  if (limited.limited) return limited.response;

  try {
    const result = await sendVerifiedSignupNotifications(getSupabaseAdminClient(), user.id);
    return NextResponse.json(
      { success: result.sent, alreadyProcessed: Boolean(result.alreadyProcessed), skipped: Boolean(result.skipped) },
      { headers: { ...limited.headers, 'Cache-Control': 'no-store' } },
    );
  } catch (cause) {
    console.error('Verified signup notification failed:', cause instanceof Error ? cause.message : 'unknown error');
    return NextResponse.json({ error: 'Unable to process account notification.' }, { status: 500 });
  }
}

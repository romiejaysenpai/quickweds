import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import { getWelcomeEmailReact } from '@/emails/quickweds-transactional';
import { getPrimaryAdminEmail } from '@/lib/admin';
import { createRateLimitMiddleware, sanitizeEmail, sanitizeInput } from '@/lib/rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

type SignupRecord = {
  id?: string;
  email?: string;
  full_name?: string;
  display_name?: string;
  account_type?: string;
  source?: string;
};

const RECENT_SIGNUP_WINDOW_MS = 15 * 60 * 1000;

async function isAuthorizedSignupNotification(
  req: NextApiRequest,
  userEmail: string,
  recordId?: string
): Promise<boolean> {
  const configuredSecret =
    process.env.SUPABASE_WEBHOOK_SECRET ||
    process.env.WEBHOOK_SECRET ||
    process.env.CRON_SECRET ||
    '';
  const headerSecret =
    typeof req.headers['x-webhook-secret'] === 'string'
      ? req.headers['x-webhook-secret'].trim()
      : '';
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization : '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (configuredSecret && (headerSecret === configuredSecret || bearerToken === configuredSecret)) {
    return true;
  }

  let db: any;
  try {
    db = getSupabaseAdminClient();
  } catch {
    return false;
  }

  const normalizedEmail = userEmail.trim().toLowerCase();

  if (bearerToken) {
    const { data: authData, error: authError } = await db.auth.getUser(bearerToken);
    const authedEmail = authData?.user?.email?.trim().toLowerCase();
    if (!authError && authedEmail && authedEmail === normalizedEmail) {
      return true;
    }
  }

  if (recordId) {
    const { data: byIdData } = await db.auth.admin.getUserById(recordId);
    const matchedUser = byIdData?.user;
    if (matchedUser && matchedUser.email?.trim().toLowerCase() === normalizedEmail && matchedUser.created_at) {
      const ageMs = Date.now() - new Date(matchedUser.created_at).getTime();
      if (ageMs >= -60_000 && ageMs <= RECENT_SIGNUP_WINDOW_MS) {
        return true;
      }
    }
  }

  const { data: usersData } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  const users: Array<{ email?: string; created_at?: string }> = usersData?.users || [];
  const recentMatch = users.find((u) => {
    if (u.email?.trim().toLowerCase() !== normalizedEmail || !u.created_at) return false;
    const ageMs = Date.now() - new Date(u.created_at).getTime();
    return ageMs >= -60_000 && ageMs <= RECENT_SIGNUP_WINDOW_MS;
  });

  return Boolean(recentMatch);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendSignupToGhl(record: SignupRecord, signupDate: string) {
  const webhookUrl = process.env.GHL_SIGNUP_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: true, skipped: true };
  }

  const email = sanitizeEmail(record.email || '');
  if (!email) {
    return { success: false, skipped: true, error: 'Missing signup email for GHL' };
  }

  const fullName = sanitizeInput(record.full_name || record.display_name || '', { maxLength: 120 });
  const [firstName = '', ...lastNameParts] = fullName.split(/\s+/).filter(Boolean);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        full_name: fullName || 'QuickWeds User',
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        account_type: sanitizeInput(record.account_type || 'unknown', { maxLength: 50 }),
        source: sanitizeInput(record.source || 'quickweds_signup', { maxLength: 80 }),
        signup_date: signupDate,
        app: 'QuickWeds',
        tags: ['quickweds', 'signup'],
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return { success: false, error: `GHL webhook failed: ${response.status} ${text}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown GHL webhook error' };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rateLimit = createRateLimitMiddleware('SIGNUP_NOTIFY');
  const clientIP = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || (req.headers['x-real-ip'] as string)
    || 'unknown';
  const limited = await rateLimit.check(clientIP);
  if (limited.limited) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const { record } = req.body as { record?: SignupRecord };
  if (!record) {
    return res.status(400).json({ error: 'No user record provided' });
  }

  const adminEmail = getPrimaryAdminEmail();
  const userEmail = sanitizeEmail(record.email || '');
  const userName = sanitizeInput(record.full_name || record.display_name || 'New User', { maxLength: 120 });
  const signupDate = new Date().toISOString();

  if (!userEmail) {
    return res.status(400).json({ error: 'Valid user email is required' });
  }

  const authorized = await isAuthorizedSignupNotification(req, userEmail, record.id);
  if (!authorized) {
    return res.status(401).json({ error: 'Unauthorized signup notification request' });
  }

  try {
    const adminEmailPromise = adminEmail ? sendEmail({
      to: adminEmail,
      subject: `New Signup on QuickWeds (${userEmail})`,
      html: `
        <div style="font-family: Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #D16C78; font-size: 24px; margin-bottom: 24px;">New Registration Alert</h1>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            A new user has joined QuickWeds.
          </p>
          <div style="background-color: #FFF8F4; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7A5A61;">User Email</p>
            <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #3A2A2D;">${escapeHtml(userEmail)}</p>
            <p style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7A5A61;">Name</p>
            <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #3A2A2D;">${escapeHtml(userName)}</p>
            <p style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7A5A61;">Signup Time</p>
            <p style="margin: 0; font-size: 16px; color: #3A2A2D;">${escapeHtml(signupDate)}</p>
          </div>
        </div>
      `,
    }) : Promise.resolve({ success: true, skipped: true });

    const userWelcomePromise = sendEmail({
      to: userEmail,
      subject: `Welcome to QuickWeds, ${userName}!`,
      react: getWelcomeEmailReact(userName),
    });

    const ghlPromise = sendSignupToGhl(record, signupDate);
    const [adminResult, userResult, ghlResult] = await Promise.all([adminEmailPromise, userWelcomePromise, ghlPromise]);

    if (adminResult.success && userResult.success && ghlResult.success) {
      return res.status(200).json({ success: true, ghl: ghlResult, message: 'All notifications sent successfully' });
    }

    return res.status(207).json({
      success: false,
      admin: adminResult.success,
      user: userResult.success,
      ghl: ghlResult,
      error: 'One or more emails failed to send',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown signup email error';
    return res.status(500).json({ success: false, error: message });
  }
}

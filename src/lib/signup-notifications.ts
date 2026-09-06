import 'server-only';

import { getWelcomeEmailReact } from '@/emails/quickweds-transactional';
import { getPrimaryAdminEmail } from '@/lib/admin';
import { sendEmail } from '@/lib/email';
import { sanitizeEmail, sanitizeInput } from '@/lib/rate-limit';

type AdminDb = any;

type SignupNotificationResult = {
  sent: boolean;
  alreadyProcessed?: boolean;
  skipped?: boolean;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendSignupToGhl(record: { email: string; fullName: string }, signupDate: string) {
  const webhookUrl = process.env.GHL_SIGNUP_WEBHOOK_URL;
  if (!webhookUrl) return { success: true };

  const [firstName = '', ...lastNameParts] = record.fullName.split(/\s+/).filter(Boolean);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: record.email,
        full_name: record.fullName || 'QuickWeds User',
        first_name: firstName,
        last_name: lastNameParts.join(' '),
        source: 'verified_signup',
        signup_date: signupDate,
        app: 'QuickWeds',
        tags: ['quickweds', 'signup'],
      }),
    });

    if (!response.ok) {
      console.error('Verified signup GHL webhook failed:', response.status);
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    console.error('Verified signup GHL webhook failed:', error instanceof Error ? error.message : 'unknown error');
    return { success: false };
  }
}

function isUniqueViolation(error: unknown) {
  const record = error as { code?: unknown; message?: unknown } | null;
  return record?.code === '23505' || String(record?.message || '').toLowerCase().includes('duplicate key');
}

/**
 * Sends signup notifications for the authenticated user only. The database
 * event record is the idempotency barrier, so a browser cannot select an
 * arbitrary recipient or trigger duplicate sends by retrying the request.
 */
export async function sendVerifiedSignupNotifications(
  db: AdminDb,
  userId: string,
): Promise<SignupNotificationResult> {
  const { data: userData, error: userError } = await db.auth.admin.getUserById(userId);
  if (userError || !userData?.user) throw userError || new Error('Authenticated user was not found.');

  const user = userData.user;
  if (!user.email_confirmed_at && !user.confirmed_at) {
    return { sent: false, skipped: true };
  }

  const email = sanitizeEmail(user.email || '');
  if (!email) throw new Error('Authenticated user does not have a valid email address.');

  const metadata = user.user_metadata || {};
  const fullName = sanitizeInput(
    String(metadata.full_name || metadata.name || metadata.display_name || 'New User'),
    { maxLength: 120 },
  ) || 'New User';
  const signupDate = new Date().toISOString();

  const { error: eventError } = await db
    .from('signup_notification_events')
    .insert({ user_id: user.id, status: 'processing', last_attempt_at: signupDate });

  if (eventError) {
    if (isUniqueViolation(eventError)) return { sent: false, alreadyProcessed: true };
    throw eventError;
  }

  const adminEmail = getPrimaryAdminEmail();
  const [adminResult, welcomeResult, ghlResult] = await Promise.all([
    adminEmail
      ? sendEmail({
          to: adminEmail,
          subject: `New verified QuickWeds signup (${email})`,
          html: `<p>A verified user has joined QuickWeds.</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Name:</strong> ${escapeHtml(fullName)}</p><p><strong>Time:</strong> ${escapeHtml(signupDate)}</p>`,
        })
      : Promise.resolve({ success: true }),
    sendEmail({
      to: email,
      subject: `Welcome to QuickWeds, ${fullName}!`,
      react: getWelcomeEmailReact(fullName),
    }),
    sendSignupToGhl({ email, fullName }, signupDate),
  ]);

  const sent = Boolean(adminResult.success && welcomeResult.success && ghlResult.success);
  const { error: updateError } = await db
    .from('signup_notification_events')
    .update({ status: sent ? 'sent' : 'failed', sent_at: sent ? new Date().toISOString() : null })
    .eq('user_id', user.id);
  if (updateError) console.error('Unable to record signup notification result:', updateError.message);

  return { sent };
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';
import { getWelcomeEmailHtml } from '@/lib/email-templates';

type SignupRecord = {
  email?: string;
  full_name?: string;
  display_name?: string;
  account_type?: string;
  source?: string;
};

async function sendSignupToGhl(record: SignupRecord, signupDate: string) {
  const webhookUrl = process.env.GHL_SIGNUP_WEBHOOK_URL;
  if (!webhookUrl) {
    return { success: true, skipped: true };
  }

  const email = (record.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return { success: false, skipped: true, error: 'Missing signup email for GHL' };
  }

  const fullName = (record.full_name || record.display_name || '').trim();
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
        account_type: record.account_type || 'unknown',
        source: record.source || 'quickweds_signup',
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
  // 1. Security Check: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Extract User Data (passed from Supabase Webhook)
  const { record } = req.body as { record?: SignupRecord };
  if (!record) {
    return res.status(400).json({ error: 'No user record provided' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL || "romiejayabacasmas@gmail.com";
  const userEmail = record.email || "Unknown Email";
  const userName = record.full_name || record.display_name || "New User";
  const signupDate = new Date().toLocaleString();

  try {
    // 3. Send Notification to Admin
    const adminEmailPromise = sendEmail({
      to: adminEmail,
      subject: `✨ New Signup on QuickWeds! (${userEmail})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #eee; border-radius: 20px;">
          <h1 style="color: #D16C78; font-size: 24px; margin-bottom: 24px;">New Registration Alert!</h1>
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            Hello Admin,<br><br>
            A new user has just joined <strong>QuickWeds</strong>. Here are the details:
          </p>
          <div style="background-color: #FFF8F4; padding: 24px; border-radius: 12px; margin: 24px 0;">
            <p style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7A5A61;">User Email</p>
            <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #3A2A2D;">${userEmail}</p>
            
            <p style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7A5A61;">Name</p>
            <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #3A2A2D;">${userName}</p>
            
            <p style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #7A5A61;">Signup Time</p>
            <p style="margin: 0; font-size: 16px; color: #3A2A2D;">${signupDate}</p>
          </div>
        </div>
      `
    });

    // 4. Send Welcome Email to the User
    const userWelcomePromise = sendEmail({
      to: userEmail,
      subject: `Welcome to QuickWeds, ${userName}! ✨`,
      html: getWelcomeEmailHtml(userName)
    });

    const ghlPromise = sendSignupToGhl(record, signupDate);

    // Run notifications in parallel for speed
    const [adminResult, userResult, ghlResult] = await Promise.all([adminEmailPromise, userWelcomePromise, ghlPromise]);

    if (adminResult.success && userResult.success && ghlResult.success) {
      return res.status(200).json({ success: true, ghl: ghlResult, message: 'All notifications sent successfully' });
    } else {
      return res.status(207).json({ 
        success: false, 
        admin: adminResult.success, 
        user: userResult.success,
        ghl: ghlResult,
        error: 'One or more emails failed to send' 
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown signup email error';
    return res.status(500).json({ success: false, error: message });
  }
}

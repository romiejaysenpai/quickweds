import type { NextApiRequest, NextApiResponse } from 'next';
import { sendEmail } from '@/lib/email';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Security Check: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Extract User Data (passed from Supabase Webhook)
  const { record } = req.body;
  if (!record) {
    return res.status(400).json({ error: 'No user record provided' });
  }

  const adminEmail = "romiejayabacasmas@gmail.com";
  const userEmail = record.email || "Unknown Email";
  const userName = record.full_name || record.display_name || "New User";
  const signupDate = new Date().toLocaleString();

  try {
    // 3. Send Notification to Admin
    const result = await sendEmail({
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
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">
            This is an automated notification from your QuickWeds Admin System.
          </p>
        </div>
      `
    });

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Admin notified' });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

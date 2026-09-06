import type { NextApiRequest, NextApiResponse } from 'next';

// Signup notifications used to accept arbitrary browser-provided recipient data.
// Keep the route in place for old clients, but never allow it to perform a side effect.
// Verified notifications are now dispatched by /api/auth/signup-notification.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(410).json({
    error: 'This endpoint has been retired. Complete sign-in to receive account notifications.',
  });
}

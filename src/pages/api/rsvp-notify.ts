import type { NextApiRequest, NextApiResponse } from 'next';

// RSVP notifications are sent only by the idempotent public RSVP write route.
// This legacy route accepted unauthenticated data and could be abused as an email relay.
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(410).json({
    error: 'This endpoint has been retired. Submit RSVPs through the wedding page.',
  });
}

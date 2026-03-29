import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { Resend } from 'resend';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Initialize Resend with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  // API Route for sending emails
  app.post('/api/notify', async (req, res) => {
    try {
      const { to, subject, html, replyTo } = req.body;

      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured');
        return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
      }

      // Sanitize the environment variable in case it was added with quotes
      const rawFromEmail = process.env.RESEND_FROM_EMAIL || 'Omoide Studio <hello@rsvp.quickweds.site>';
      let fromEmail = rawFromEmail.replace(/['"]/g, '').trim();

      // Basic email validation to prevent Resend validation_errors for malformed emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const toEmail = Array.isArray(to) ? to[0] : to;
      
      if (!toEmail || !emailRegex.test(toEmail)) {
        console.error(`Invalid 'to' email address provided: ${toEmail}`);
        return res.status(400).json({ error: { message: `Invalid email address format: ${toEmail}` } });
      }

      console.log(`Attempting to send email FROM: "${fromEmail}" TO: "${to}"`);

      let { data, error } = await resend.emails.send({
        from: fromEmail,
        to: to,
        subject: subject,
        html: html,
        replyTo: replyTo,
      });

      // Fallback 1: If the custom domain is not verified yet, fallback to the Resend onboarding domain
      if (error && error.name === 'validation_error' && error.message.includes('domain is not verified')) {
        console.log(`Domain not verified yet. Falling back to onboarding@resend.dev`);
        const fallbackFrom = 'Omoide Studio <onboarding@resend.dev>';
        
        const fallbackResult = await resend.emails.send({
          from: fallbackFrom,
          to: to,
          subject: subject,
          html: html,
          replyTo: replyTo,
        });
        
        data = fallbackResult.data;
        error = fallbackResult.error;
        
        // Update fromEmail for the next fallback if needed
        fromEmail = fallbackFrom;
      }

      // Fallback 2: If using the onboarding domain and sending to an unverified email, redirect to the verified email
      if (error && error.name === 'validation_error' && error.message.includes('testing emails to your own email address')) {
        const match = error.message.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          const verifiedEmail = match[1];
          console.log(`Auto-redirecting email to verified address: ${verifiedEmail}`);
          
          const retryResult = await resend.emails.send({
            from: fromEmail,
            to: verifiedEmail,
            subject: subject,
            html: html,
            replyTo: replyTo,
          });
          
          data = retryResult.data;
          error = retryResult.error;
        }
      }

      if (error) {
        console.error('Resend API Error Details:', JSON.stringify(error, null, 2));
        return res.status(400).json({ error });
      }

      console.log('Email sent successfully:', data);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error in /api/notify route:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

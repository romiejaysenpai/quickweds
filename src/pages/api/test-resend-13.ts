import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

async function test() {
  const { data, error } = await resend.emails.send({
    from: 'invalid',
    to: 'romiejaybacasmas@gmail.com',
    subject: 'Test',
    html: '<p>Test</p>',
  } as any);
  console.log(JSON.stringify(error, null, 2));
}
test();

import { Resend } from 'resend';

const resend = new Resend('re_UfESa9az_MN2J4D6MKmp86WCDJRwWK1nz');

async function testEmail() {
    try {
        const { data, error } = await resend.emails.send({
            from: 'QuickWeds <noreply@rsvp.quickweds.site>',
            to: ['resend-test@example.com'], // using a dummy for API validation check
            subject: 'Test Email Validation',
            html: '<p>Testing Resend configuration.</p>'
        });

        if (error) {
            console.error("Test Error:", error);
        } else {
            console.log("Test Success:", data);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

testEmail();

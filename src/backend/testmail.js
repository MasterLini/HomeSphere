import { sendEmail } from './utils/mailer.js';

(async () => {
    try {
        await sendEmail({
            to: 'christian.schallner@icloud.com',
            subject: 'Test Email',
            text: 'This is a test email from HomeSphere',
            html: '<p>This is a test email from HomeSphere</p>'
        });
        console.log('Test email sent successfully.');
    } catch (err) {
        console.error('Test email failed:', err);
    }
})();

// utils/mailer.js
import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create a transporter using your SMTP settings
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,      // your SMTP username
        pass: process.env.GMAIL_PASS,      // your SMTP password
    },
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM, // e.g., "HomeSphere <no-reply@homesphere.com>"
            to,
            subject,
            text,
            html,
        });
        logger.info(`Email sent: ${info.messageId}`);
    } catch (error) {
        logger.error('Error sending email:', error);
        throw error;
    }
};

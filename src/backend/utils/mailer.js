// utils/mailer.js
import nodemailer from 'nodemailer';
import logger from './logger.js';

// Create a transporter using your SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use `true` for port 465, `false` for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
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

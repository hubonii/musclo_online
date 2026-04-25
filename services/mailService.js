const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    const port = parseInt(process.env.MAIL_PORT || '587', 10);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    console.log(`[MAIL] Initializing with host: ${process.env.MAIL_HOST || 'smtp.gmail.com'}, port: ${port}, user: ${user ? 'FOUND' : 'MISSING'}`);

    const config = {
      // Use 'gmail' service preset for best compatibility with Gmail App Passwords
      service: (process.env.MAIL_HOST === 'smtp.gmail.com' || !process.env.MAIL_HOST) ? 'gmail' : undefined,
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465, 
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000, // 10 seconds timeout
      greetingTimeout: 10000,
      socketTimeout: 20000
    };

    this.transporter = nodemailer.createTransport(config);

    // Verify connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[MAIL] Connection verification failed:', error);
      } else {
        console.log('[MAIL] SMTP Server is ready to take our messages');
      }
    });
  }

  async sendMail(to, subject, html) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('[MAIL] Missing credentials. Email not sent.');
      return null;
    }
    try {
      console.log(`[MAIL] Attempting to send email to ${to}...`);
      const info = await this.transporter.sendMail({
        from: `"Musclo AI" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Mail sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Mail Error:', error);
      // Don't throw if we want the app to keep working even if mail fails
      // throw error;
    }
  }

  async sendVerificationCode(to, code) {
    const subject = 'Verify your Musclo account';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #EA580C;">Welcome to Musclo!</h2>
        <p>Please use the code below to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #EA580C; margin: 20px 0; text-align: center;">
          ${code}
        </div>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }

  async sendResetCode(to, code) {
    const subject = 'Reset your Musclo password';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #EA580C;">Password Reset Request</h2>
        <p>You requested to reset your password. Use the 6-digit code below to proceed:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #EA580C; margin: 20px 0; text-align: center;">
          ${code}
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email and ensure your account is secure.</p>
      </div>
    `;
    return this.sendMail(to, subject, html);
  }
}

module.exports = new MailService();

const nodemailer = require('nodemailer');

class MailService {
  constructor() {
    const port = parseInt(process.env.MAIL_PORT || '587', 10);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    console.log(`[MAIL] Initializing with host: ${process.env.MAIL_HOST || 'smtp.gmail.com'}, port: ${port}, user: ${user ? 'FOUND' : 'MISSING'}`);

    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: port,
      // Direct TLS (secure: true) is usually only for port 465. 
      // Port 587 (Gmail default) uses STARTTLS, which requires secure: false.
      secure: port === 465, 
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        // Do not fail on invalid certificates (useful for some SMTP relays)
        rejectUnauthorized: false
      }
    });
  }

  async sendMail(to, subject, html) {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('Mail Service: Missing credentials. Email not sent.');
      return null;
    }
    try {
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

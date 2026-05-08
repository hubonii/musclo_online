/**
 * Service for sending transactional emails using the Resend API.
 */
const { Resend } = require('resend');

class MailService {
  constructor() {

    const apiKey = process.env.RESEND_API_KEY || 're_hLM6ZTqK_8Rc8X2ijwFTvaSseaKaNvJtD';
    this.resend = new Resend(apiKey);
    

    this.fromEmail = process.env.MAIL_FROM || 'noreply@musclo.tech';
    
    console.log(`[MAIL] Initialized with Resend API (Key: ${apiKey.substring(0, 5)}...)`);
  }

  /**
   * Sends an email using the Resend API.
   * @param {string} to - Recipient email address.
   * @param {string} subject - Email subject line.
   * @param {string} html - HTML body content.
   * @returns {Promise<Object|null>} Response data or null on failure.
   */
  async sendMail(to, subject, html) {
    if (!to) return null;

    try {
      console.log(`[MAIL] Attempting to send Resend email to ${to}...`);
      
      const { data, error } = await this.resend.emails.send({
        from: `Musclo <${this.fromEmail}>`,
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('[MAIL] Resend API Error:', error);
        return null;
      }

      console.log('[MAIL] Resend email sent successfully:', data.id);
      return data;
    } catch (error) {
      console.error('[MAIL] Unexpected Error:', error);
      return null;
    }
  }

  /**
   * Sends a 6-digit verification code to the user's email.
   * @param {string} to - Recipient email address.
   * @param {string} code - The 6-digit verification code.
   * @returns {Promise<Object|null>}
   */
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

  /**
   * Sends a 6-digit password reset code to the user's email.
   * @param {string} to - Recipient email address.
   * @param {string} code - The 6-digit reset code.
   * @returns {Promise<Object|null>}
   */
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

/**
 * Service for handling transactional email operations via Resend.
 */
module.exports = new MailService();

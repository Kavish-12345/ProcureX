import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import logger from './logger.js';

const isConfigured = Boolean(config.gmailUser && config.gmailAppPassword);

// Built once and reused — nodemailer pools connections per transport, so
// creating one per email would throw away that reuse.
const transporter = isConfigured
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.gmailUser,
        // A Google App Password, not the account password — requires 2FA to be
        // enabled on the account before one can be generated.
        pass: config.gmailAppPassword,
      },
    })
  : null;

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  // Without credentials (tests, and local dev before anyone sets them up) the
  // link goes to the log instead, so the reset flow stays fully usable offline.
  if (!transporter) {
    logger.info(`[mailer not configured] Password reset link for ${to}: ${resetLink}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `ProcureX <${config.gmailUser}>`,
      to,
      subject: 'Reset your ProcureX password',
      text: `Reset your password using this link (valid for 15 minutes): ${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
      html: `
        <p>Reset your ProcureX password using the link below. It's valid for 15 minutes.</p>
        <p><a href="${resetLink}">Reset my password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  } catch (error) {
    // Deliberately swallowed: the caller returns the same generic response
    // whether or not the address exists, so surfacing a send failure to the
    // client would leak exactly what that response is designed to hide.
    logger.error(`Failed to send password reset email to ${to}:`, error);
  }
}

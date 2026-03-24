import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export class EmailService {
  async sendPasswordReset(email: string, resetToken: string) {
    const resetUrl = `${env.APP_URL}/auth/reset-password?token=${resetToken}`;

    if (!resend) {
      console.log(`[EmailService] Resend not configured. Reset URL for ${email}: ${resetUrl}`);
      return;
    }

    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: email,
      subject: "Reset your Receipt Radar password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 16px;">Reset your password</h1>
          <p style="font-size: 15px; color: #334155; line-height: 1.7; margin: 0 0 24px;">
            We received a request to reset your Receipt Radar password. Click the button below to choose a new one. This link expires in 1 hour.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: #fff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 12px;">
            Reset password
          </a>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin: 24px 0 0;">
            If you did not request this, you can safely ignore this email. Your password will not change.
          </p>
        </div>
      `
    });
  }
}

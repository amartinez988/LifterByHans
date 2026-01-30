import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Uplio <noreply@uplio.app>";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your email - Uplio",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;"></div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">UPLIO</h1>
            </div>
            
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0f172a;">Verify your email</h2>
            <p style="margin: 0 0 24px; color: #64748b; line-height: 1.6;">
              Thanks for signing up for Uplio! Click the button below to verify your email address and get started.
            </p>
            
            <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 14px;">
              Verify Email
            </a>
            
            <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">
              If you didn't create an account, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            
            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} Uplio. Elevator & escalator service management.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your password - Uplio",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;"></div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">UPLIO</h1>
            </div>
            
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0f172a;">Reset your password</h2>
            <p style="margin: 0 0 24px; color: #64748b; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 14px;">
              Reset Password
            </a>
            
            <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            
            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} Uplio. Elevator & escalator service management.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendTeamInviteEmail(
  email: string,
  inviterName: string,
  companyName: string,
  inviteCode: string,
  role: string
) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteCode}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `You're invited to join ${companyName} on Uplio`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;"></div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">UPLIO</h1>
            </div>
            
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0f172a;">You're invited!</h2>
            <p style="margin: 0 0 24px; color: #64748b; line-height: 1.6;">
              <strong style="color: #0f172a;">${inviterName}</strong> has invited you to join <strong style="color: #0f172a;">${companyName}</strong> on Uplio as a <strong style="color: #0f172a;">${role}</strong>.
            </p>
            
            <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 14px;">
              Accept Invitation
            </a>
            
            <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">
              This invitation will expire in 7 days. If you don't know ${inviterName}, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            
            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} Uplio. Elevator & escalator service management.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Welcome to Uplio! 🎉",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;"></div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">UPLIO</h1>
            </div>
            
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0f172a;">Welcome to Uplio, ${name}! 🎉</h2>
            <p style="margin: 0 0 24px; color: #64748b; line-height: 1.6;">
              Your account is all set up. Here's what you can do next:
            </p>
            
            <ul style="margin: 0 0 24px; padding-left: 20px; color: #64748b; line-height: 1.8;">
              <li>Add your management companies and buildings</li>
              <li>Import your elevator and escalator units</li>
              <li>Set up inspection tracking for compliance</li>
              <li>Invite your team members</li>
            </ul>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/app" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 14px;">
              Go to Dashboard
            </a>
            
            <p style="margin: 24px 0 0; font-size: 13px; color: #94a3b8;">
              Need help getting started? Reply to this email and we'll be happy to assist.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
            
            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
              © ${new Date().getFullYear()} Uplio. Elevator & escalator service management.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, units, message } = body;

    // Validate required fields
    if (!name || !email || !company || !units || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Send notification email to Uplio team
    const notificationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #4f46e5;">🎯 New Demo Request</h1>
            </div>
            
            <div style="background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #0f172a;">Contact Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Email:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">
                    <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Company:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">${company}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Phone:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">${phone || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Units Managed:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-size: 14px; font-weight: 500;">
                    <span style="background: #4f46e5; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${units}</span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 24px;">
              <h2 style="margin: 0 0 12px; font-size: 18px; font-weight: 600; color: #0f172a;">Message</h2>
              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; border-left: 4px solid #4f46e5;">
                <p style="margin: 0; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0;">
              <a href="mailto:${email}?subject=Re: Your Uplio Demo Request" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Reply to ${name.split(" ")[0]}
              </a>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to your business email
    await sendEmail({
      to: "a.martinez988@gmail.com", // Your email - change to hello@uplio.app when ready
      subject: `🎯 Demo Request: ${company} (${units})`,
      html: notificationHtml,
    });

    // Send confirmation email to the requester
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 32px;">
              <img src="https://uplio.app/email-logo.png" alt="Uplio" width="48" height="48" style="margin-bottom: 16px;" />
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #4f46e5;">UPLIO</h1>
            </div>
            
            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #0f172a;">Thanks for reaching out, ${name.split(" ")[0]}!</h2>
            
            <p style="margin: 0 0 16px; color: #64748b; line-height: 1.6;">
              We received your demo request for <strong style="color: #0f172a;">${company}</strong> and we're excited to show you how Uplio can help streamline your elevator service operations.
            </p>
            
            <p style="margin: 0 0 24px; color: #64748b; line-height: 1.6;">
              A member of our team will reach out within <strong style="color: #0f172a;">24 hours</strong> to schedule a personalized demo at a time that works for you.
            </p>
            
            <div style="background: linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">In the meantime, you can:</p>
              <ul style="margin: 0; padding-left: 20px; color: #334155;">
                <li style="margin-bottom: 8px;">Start a <a href="https://uplio.app/signup" style="color: #4f46e5; text-decoration: none; font-weight: 500;">free trial</a> to explore on your own</li>
                <li style="margin-bottom: 8px;">Check out our features at <a href="https://uplio.app" style="color: #4f46e5; text-decoration: none; font-weight: 500;">uplio.app</a></li>
              </ul>
            </div>
            
            <p style="margin: 0; color: #64748b; line-height: 1.6;">
              Questions? Just reply to this email.
            </p>
            
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Uplio • Elevator Service Management Software
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: "We received your demo request - Uplio",
      html: confirmationHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

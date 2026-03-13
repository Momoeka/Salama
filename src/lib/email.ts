import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "SALAMA <onboarding@resend.dev>";

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f; padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#13131a; border-radius:12px; border:1px solid #2a2a3d; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed, #9333ea, #a855f7); padding:32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700; letter-spacing:1px;">SALAMA</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid #2a2a3d; text-align:center;">
              <p style="margin:0; color:#6b6b80; font-size:12px;">
                &copy; ${new Date().getFullYear()} Salama. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, username: string) {
  const html = baseLayout(`
    <h2 style="margin:0 0 16px; color:#e4e4ed; font-size:22px;">
      Welcome aboard, ${username}! 🎉
    </h2>
    <p style="margin:0 0 24px; color:#9999ad; font-size:16px; line-height:1.6;">
      We're thrilled to have you join <strong style="color:#a855f7;">Salama</strong>.
      Your account is all set up and ready to go.
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="background-color:#7c3aed; border-radius:8px; padding:14px 32px;">
          <a href="#" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600;">
            Start Exploring
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0; color:#6b6b80; font-size:14px; line-height:1.5;">
      Share posts, connect with others, and make the most of the community.
      If you have any questions, don't hesitate to reach out.
    </p>
  `);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `Welcome to Salama, ${username}!`,
    html,
  });
}

export async function sendNotificationEmail(
  email: string,
  username: string,
  type: "like" | "comment" | "follow",
  message: string
) {
  const icons: Record<string, string> = {
    like: "❤️",
    comment: "💬",
    follow: "👥",
  };

  const subjects: Record<string, string> = {
    like: "Someone liked your post!",
    comment: "New comment on your post!",
    follow: "You have a new follower!",
  };

  const accentColors: Record<string, string> = {
    like: "#ef4444",
    comment: "#3b82f6",
    follow: "#a855f7",
  };

  const icon = icons[type] || "🔔";
  const accent = accentColors[type] || "#a855f7";

  const html = baseLayout(`
    <div style="text-align:center; margin-bottom:24px;">
      <span style="font-size:48px;">${icon}</span>
    </div>
    <h2 style="margin:0 0 16px; color:#e4e4ed; font-size:22px; text-align:center;">
      Hey ${username}!
    </h2>
    <div style="background-color:#1a1a2e; border-left:4px solid ${accent}; border-radius:8px; padding:20px; margin:0 0 24px;">
      <p style="margin:0; color:#c4c4d4; font-size:16px; line-height:1.6;">
        ${message}
      </p>
    </div>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="background-color:#7c3aed; border-radius:8px; padding:14px 32px;">
          <a href="#" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600;">
            View on Salama
          </a>
        </td>
      </tr>
    </table>
    <p style="margin:0; color:#6b6b80; font-size:13px; text-align:center;">
      You received this because you have notifications enabled on Salama.
    </p>
  `);

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: subjects[type] || "New notification from Salama",
    html,
  });
}

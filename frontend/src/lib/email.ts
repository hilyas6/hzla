const RESEND_API_URL = "https://api.resend.com/emails";

const COLOR = {
  background: "#060608",
  card: "#0d0f1a",
  foreground: "#e8f4ff",
  muted: "#8b95ab",
  yellow: "#fcee0a",
  cyan: "#00f0ff",
  pink: "#ff2a6d",
  border: "#1a2233",
};

function emailShell(preheader: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:${COLOR.background};font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
    <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:${COLOR.card};border:1px solid ${COLOR.border};">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${COLOR.border};">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${COLOR.yellow};color:#0a0a0f;font-weight:800;font-size:14px;padding:6px 9px;">Hz</td>
                    <td style="padding-left:10px;color:${COLOR.foreground};font-weight:700;font-size:16px;letter-spacing:3px;">HZLA</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:${COLOR.foreground};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;border-top:1px solid ${COLOR.border};color:${COLOR.muted};font-size:12px;">
                HZLA &middot; AI-powered tools for job seekers &middot; This is an automated security email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

const OTP_COPY = {
  signup: {
    subject: "Verify your HZLA email",
    heading: "Verify your email",
    lede: "Use this code to verify your email and finish creating your HZLA account.",
  },
  login: {
    subject: "Your HZLA login code",
    heading: "Your login code",
    lede: "Use this code to finish logging in to HZLA.",
  },
  reset: {
    subject: "Reset your HZLA password",
    heading: "Reset your password",
    lede: "Use this code to set a new password for your HZLA account.",
  },
} as const;

export type OtpPurpose = keyof typeof OTP_COPY;

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: OtpPurpose = "login"
) {
  const copy = OTP_COPY[purpose];
  const html = emailShell(
    `${copy.heading}: ${code}`,
    `<h1 style="margin:0 0 12px;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${COLOR.foreground};">${copy.heading}</h1>
     <p style="margin:0 0 24px;color:${COLOR.muted};">${copy.lede} It expires in 10 minutes.</p>
     <div style="text-align:center;margin:0 0 24px;">
       <span style="display:inline-block;padding:14px 28px;background:rgba(0,240,255,0.08);border:1px solid ${COLOR.cyan};color:${COLOR.cyan};font-size:28px;font-weight:800;letter-spacing:6px;font-family:'Courier New',monospace;">${code}</span>
     </div>
     <p style="margin:0;color:${COLOR.muted};font-size:13px;">Didn't request this? You can safely ignore this email — your account is still secure.</p>`
  );

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: copy.subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

export async function sendPasswordChangedEmail(to: string) {
  const html = emailShell(
    "Your HZLA password was just changed",
    `<h1 style="margin:0 0 12px;font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${COLOR.foreground};">Password changed</h1>
     <p style="margin:0 0 20px;color:${COLOR.muted};">Your HZLA account password was just changed.</p>
     <div style="padding:14px 16px;background:rgba(255,42,109,0.08);border-left:3px solid ${COLOR.pink};margin:0 0 20px;">
       <p style="margin:0;color:${COLOR.foreground};font-size:14px;"><strong>Wasn't you?</strong> Someone else may have access to your account. Reset your password immediately and contact support.</p>
     </div>
     <p style="margin:0;color:${COLOR.muted};font-size:13px;">If this was you, no action is needed.</p>`
  );

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: "Your HZLA password was changed",
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

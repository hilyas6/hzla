const RESEND_API_URL = "https://api.resend.com/emails";

export async function sendOtpEmail(to: string, code: string) {
  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to,
      subject: "Your HZLA login code",
      html: `<p>Your login code is <strong>${code}</strong>.</p><p>It expires in 10 minutes. If you didn't try to log in, ignore this email.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

export async function sendPasswordChangedEmail(to: string) {
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
      html: `<p>Your password was just changed.</p><p>If this wasn't you, someone else may have access to your account — reset your password immediately and contact support.</p>`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${body}`);
  }
}

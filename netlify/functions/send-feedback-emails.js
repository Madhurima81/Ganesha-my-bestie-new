// Scheduled (daily) — see netlify.toml [functions."send-feedback-emails"].
// Sends a one-time feedback email to every beta parent whose signup is 3+ days
// old and who has not been emailed yet, then stamps feedback_email_sent_at so
// they are never emailed again.
//
// Required Netlify env vars:
//   RESEND_API_KEY            (reused from send-continuation.js)
//   RESEND_FROM_EMAIL         (optional; same default as send-continuation.js)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY (service-role key — bypasses RLS)

const FEEDBACK_FORM_URL = 'PLACEHOLDER_GOOGLE_FORM_URL';

const SUBJECT = "How's it going with Ganesha My Bestie?";

const DELAY_DAYS = 3;

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildText = () =>
  `Hi there,

Your family has been exploring GMB for a few days now — we'd love to hear how it's going.

It'll take less than 2 minutes: Share your thoughts → ${FEEDBACK_FORM_URL}

Thank you for being one of our first families. Your feedback shapes what we build next.

— Madhurima, Ganesha My Bestie`;

const buildHtml = () => {
  const safeUrl = escapeHtml(FEEDBACK_FORM_URL);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="x-apple-disable-message-reformatting">
  <title>How's it going with Ganesha My Bestie?</title>
</head>
<body style="margin:0;padding:0;background:#FFF9E6;font-family:Arial,Helvetica,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFF9E6;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:560px;background:#FFFFFF;border-radius:28px;border:1px solid #E7DFF4;">
          <tr>
            <td style="padding:34px 36px 0;">
              <p style="margin:0;font-size:17px;line-height:1.6;color:#333333;">Hi there,</p>
              <p style="margin:16px 0 0;font-size:17px;line-height:1.6;color:#333333;">
                Your family has been exploring GMB for a few days now — we&rsquo;d love to hear how it&rsquo;s going.
              </p>
              <p style="margin:16px 0 0;font-size:17px;line-height:1.6;color:#333333;">
                It&rsquo;ll take less than 2 minutes:
                <a href="${safeUrl}" style="color:#6F5BA7;font-weight:800;text-decoration:none;">Share your thoughts &rarr;</a>
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 28px 6px;">
              <a href="${safeUrl}"
                 style="display:inline-block;background:#8E7CC3;color:#FFFFFF;text-decoration:none;
                        font-size:17px;font-weight:800;line-height:1;padding:16px 30px;
                        border-radius:999px;border-bottom:4px solid #6F5BA7;">
                Share your thoughts &rarr;
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 0;">
              <p style="margin:0;font-size:16px;line-height:1.6;color:#333333;">
                Thank you for being one of our first families. Your feedback shapes what we build next.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 36px 34px;">
              <p style="margin:0;font-size:16px;line-height:1.6;color:#6F5BA7;font-weight:800;">
                — Madhurima, Ganesha My Bestie
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const supabaseHeaders = (serviceKey) => ({
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
});

export const handler = async () => {
  const apiKey = process.env.RESEND_API_KEY;
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'Ganesha My Bestie <onboarding@resend.dev>';

  if (!apiKey || !supabaseUrl || !serviceKey) {
    console.error('send-feedback-emails: missing env vars', {
      hasResendKey: !!apiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!serviceKey,
    });
    return { statusCode: 500, body: 'Missing configuration.' };
  }

  if (FEEDBACK_FORM_URL === 'PLACEHOLDER_GOOGLE_FORM_URL') {
    console.error('send-feedback-emails: FEEDBACK_FORM_URL still a placeholder — aborting.');
    return { statusCode: 200, body: 'Feedback form URL not set yet; nothing sent.' };
  }

  const cutoff = new Date(Date.now() - DELAY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let rows;
  try {
    const query =
      `${supabaseUrl}/rest/v1/beta_signups` +
      `?select=id,parent_email` +
      `&feedback_email_sent_at=is.null` +
      `&signed_up_at=lte.${encodeURIComponent(cutoff)}`;
    const res = await fetch(query, { headers: supabaseHeaders(serviceKey) });
    if (!res.ok) {
      const body = await res.text();
      console.error('send-feedback-emails: query failed', res.status, body);
      return { statusCode: 502, body: 'Could not query signups.' };
    }
    rows = await res.json();
  } catch (error) {
    console.error('send-feedback-emails: query error', error);
    return { statusCode: 502, body: 'Could not query signups.' };
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { statusCode: 200, body: 'No pending feedback emails.' };
  }

  const html = buildHtml();
  const text = buildText();
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: row.parent_email, subject: SUBJECT, html, text }),
      });

      if (!resendResponse.ok) {
        const errorBody = await resendResponse.text();
        console.error(
          `send-feedback-emails: Resend failed for ${row.parent_email}`,
          resendResponse.status,
          errorBody,
        );
        failed += 1;
        continue;
      }

      const patch = await fetch(
        `${supabaseUrl}/rest/v1/beta_signups?id=eq.${encodeURIComponent(row.id)}`,
        {
          method: 'PATCH',
          headers: { ...supabaseHeaders(serviceKey), Prefer: 'return=minimal' },
          body: JSON.stringify({ feedback_email_sent_at: new Date().toISOString() }),
        },
      );

      if (!patch.ok) {
        const body = await patch.text();
        // Email already went out; log loudly so the row can be fixed by hand
        // before the next run re-sends to this family.
        console.error(
          `send-feedback-emails: SENT but failed to stamp row ${row.id} (${row.parent_email})`,
          patch.status,
          body,
        );
      }

      sent += 1;
    } catch (error) {
      console.error(`send-feedback-emails: error for ${row.parent_email}`, error);
      failed += 1;
    }
  }

  console.log(`send-feedback-emails: done. sent=${sent} failed=${failed} candidates=${rows.length}`);
  return { statusCode: 200, body: `sent=${sent} failed=${failed}` };
};

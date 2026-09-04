const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const getSiteOrigin = (event) => {
  const configuredOrigin = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, '');

  const host = event.headers.host || event.headers.Host;
  const proto =
    event.headers['x-forwarded-proto'] ||
    event.headers['X-Forwarded-Proto'] ||
    'https';

  return host ? `${proto}://${host}` : '';
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const buildEmailHtml = (continueUrl, ganeshaImageUrl) => {
  const safeUrl = escapeHtml(continueUrl);
  const safeImageUrl = escapeHtml(ganeshaImageUrl);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <meta name="x-apple-disable-message-reformatting">
  <title>Your Ganesha My Bestie adventure is ready</title>
</head>
<body style="margin:0;padding:0;background:#FFF9E6;font-family:Arial,Helvetica,sans-serif;color:#333333;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Open GMB on iPad and continue exploring.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFF9E6;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
               style="max-width:560px;background:#FFFFFF;border-radius:28px;border:1px solid #E7DFF4;">
          <tr>
            <td align="center" style="padding:34px 28px 8px;">
              <img src="${safeImageUrl}" width="120" alt="Ganesha My Bestie"
                   style="display:block;width:120px;max-width:100%;height:auto;border:0;">
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:10px 32px 0;">
              <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:800;color:#6F5BA7;">
                Your Ganesha My Bestie adventure is ready ✨
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:18px 36px 0;">
              <p style="margin:0;font-size:17px;line-height:1.6;color:#333333;">
                Open GMB on an <strong>iPad or larger screen</strong> for the best experience —
                there’s more room to play, explore and discover.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:26px 28px 10px;">
              <a href="${safeUrl}"
                 style="display:inline-block;background:#8E7CC3;color:#FFFFFF;text-decoration:none;
                        font-size:17px;font-weight:800;line-height:1;padding:16px 30px;
                        border-radius:999px;border-bottom:4px solid #6F5BA7;">
                Open GMB on iPad
              </a>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:16px 36px 0;">
              <p style="margin:0;font-size:16px;line-height:1.6;color:#333333;">
                Then hand the device to your child and let the adventure begin.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 32px 0;">
              <div style="width:34px;height:4px;border-radius:999px;background:#FFD86B;margin:0 auto 14px;"></div>
              <p style="margin:0;font-size:18px;line-height:1.4;font-weight:800;color:#6F5BA7;">
                Ganesha My Bestie
              </p>
              <p style="margin:6px 0 0;font-size:14px;line-height:1.5;color:#666666;">
                Indian wisdom children can understand — and use.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:24px 36px 34px;">
              <p style="margin:0;font-size:12px;line-height:1.55;color:#777777;">
                Opened this on your phone? Reopen this email on your iPad and tap the button there.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:16px 0 0;font-size:11px;line-height:1.5;color:#8A8A8A;">
          You’re receiving this because you asked to continue Ganesha My Bestie on another device.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Best-effort: record the signup so the daily feedback-email job can find it
// later. Never blocks or fails the continuation email if Supabase is down or
// unconfigured. Relies on the `parent_email` unique constraint + ignore-
// duplicates so a parent who submits twice keeps their original signed_up_at.
const recordBetaSignup = async (parentEmail) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('beta_signups not recorded: Supabase env vars missing.');
    return;
  }

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/beta_signups`, {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=ignore-duplicates,return=minimal',
      },
      body: JSON.stringify({ parent_email: parentEmail }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('beta_signups insert failed:', res.status, body);
    }
  } catch (error) {
    console.error('beta_signups insert error:', error);
  }
};

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, {});
  }

  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, error: 'Method not allowed.' });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { success: false, error: 'Invalid JSON body.' });
  }

  const parentEmail = String(payload.parentEmail || '').trim();
  if (!EMAIL_RE.test(parentEmail)) {
    return json(400, { success: false, error: 'A valid parentEmail is required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return json(500, { success: false, error: 'Resend is not configured.' });
  }

  const siteOrigin = getSiteOrigin(event);
  if (!siteOrigin) {
    return json(500, { success: false, error: 'App URL could not be determined.' });
  }

  const continueUrl = `${siteOrigin}/?start=parent-gate`;
  const ganeshaImageUrl = `${siteOrigin}/images/ganesha-welcome.png`;
  const from = process.env.RESEND_FROM_EMAIL || 'Ganesha My Bestie <onboarding@resend.dev>';

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: parentEmail,
        subject: 'Your Ganesha My Bestie adventure is ready',
        html: buildEmailHtml(continueUrl, ganeshaImageUrl),
        text: `Open GMB on iPad: ${continueUrl}`,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend send failed:', resendResponse.status, errorBody);
      return json(502, { success: false, error: 'Email could not be sent.' });
    }

    await recordBetaSignup(parentEmail);

    return json(200, { success: true });
  } catch (error) {
    console.error('Continuation email error:', error);
    return json(502, { success: false, error: 'Email service unavailable.' });
  }
};

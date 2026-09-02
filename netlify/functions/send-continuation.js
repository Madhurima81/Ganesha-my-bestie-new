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

const buildEmailHtml = (continueUrl) => {
  const safeUrl = escapeHtml(continueUrl);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Nunito:wght@600;700&display=swap" rel="stylesheet">
  </head>
  <body style="margin:0;background:#fff9e6;color:#4b4450;font-family:'Nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff9e6;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fffdf5;border:1px solid #eadcf7;border-radius:24px;box-shadow:0 12px 32px rgba(63,35,89,.12);">
            <tr>
              <td style="padding:30px 24px;text-align:center;">
                <h1 style="margin:0 0 10px;color:#4f315f;font-family:'Baloo 2','Trebuchet MS',Arial,sans-serif;font-size:34px;line-height:1.05;font-weight:800;">Your Ganesha My Bestie adventure is ready</h1>
                <p style="margin:0 0 24px;color:#645b67;font-size:17px;line-height:1.45;font-weight:700;">Open this link on your iPad to begin at the parent gate.</p>
                <a href="${safeUrl}" style="display:inline-block;min-height:60px;box-sizing:border-box;padding:18px 28px 15px;border-radius:999px;background:#7b55c7;color:#ffffff;text-decoration:none;font-family:'Baloo 2','Trebuchet MS',Arial,sans-serif;font-size:19px;font-weight:800;line-height:1.35;">Open GMB on iPad</a>
                <p style="margin:24px 0 0;color:#766b79;font-size:14px;line-height:1.45;">If the button does not open, paste this link into Safari on your iPad:<br><a href="${safeUrl}" style="color:#7b55c7;">${safeUrl}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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
        html: buildEmailHtml(continueUrl),
        text: `Open GMB on iPad: ${continueUrl}`,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      console.error('Resend send failed:', resendResponse.status, errorBody);
      return json(502, { success: false, error: 'Email could not be sent.' });
    }

    return json(200, { success: true });
  } catch (error) {
    console.error('Continuation email error:', error);
    return json(502, { success: false, error: 'Email service unavailable.' });
  }
};

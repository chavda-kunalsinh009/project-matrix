const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIU_K6LJczgEuU5dFS4FV5WEvVLBipTop0Gu__KfytMXN8z8nbXXbRAPpb3d_ESPDT/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { ok: false, error: 'Apps Script did not return valid JSON' };
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Mutation proxy error:', error);
    return res.status(500).json({
      ok: false,
      error: 'Unable to connect to Google Apps Script'
    });
  }
}

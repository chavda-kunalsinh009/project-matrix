const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw9hCJ1TUGzT4xVDDX4vFNoMXblw6j0wuFjUtGrZqE1x6ACNNHefy4Bvlm4kXV-cBjR/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed'
    });
  }

  try {
    const body = req.body || {};
    const payload = {
      entity: 'admin',
      action: body.action,
      pin: body.pin || '',
      adminToken: body.adminToken || '',
      serverSecret: process.env.APPS_SCRIPT_MUTATION_SECRET
    };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        ok: false,
        error: 'Apps Script did not return valid JSON'
      };
    }

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Admin proxy error:', error);

    return res.status(500).json({
      ok: false,
      error: 'Unable to connect to Google Apps Script'
    });
  }
}

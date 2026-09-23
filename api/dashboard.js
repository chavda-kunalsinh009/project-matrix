const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIU_K6LJczgEuU5dFS4FV5WEvVLBipTop0Gu__KfytMXN8z8nbXXbRAPpb3d_ESPDT/exec?api=dashboard';

export default async function handler(req, res) {
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'GET',
      redirect: 'follow',
      cache: 'no-store'
    });

    const body = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Apps Script request failed',
        status: response.status
      });
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch (error) {
      return res.status(502).json({
        error: 'Apps Script did not return valid JSON'
      });
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard proxy error:', error);
    res.status(500).json({
      error: 'Unable to connect to Google Apps Script'
    });
  }
}

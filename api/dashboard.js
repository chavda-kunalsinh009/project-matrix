const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzIU_K6LJczgEuU5dFS4FV5WEvVLBipTop0Gu__KfytMXN8z8nbXXbRAPpb3d_ESPDT/exec?api=dashboard';

let cachedData = null;
let cachedAt = 0;
const CACHE_TTL_MS = 10000;

export default async function handler(req, res) {
  try {
    const now = Date.now();

    // Reuse a warm serverless snapshot for a few seconds to avoid repeated
    // Google Apps Script / Google Sheets round trips on rapid refreshes.
    if (cachedData && now - cachedAt < CACHE_TTL_MS) {
      res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=10');
      return res.status(200).json(cachedData);
    }

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

    cachedData = data;
    cachedAt = now;

    res.setHeader('Cache-Control', 'private, max-age=5, stale-while-revalidate=10');
    res.status(200).json(data);
  } catch (error) {
    console.error('Dashboard proxy error:', error);
    res.status(500).json({
      error: 'Unable to connect to Google Apps Script'
    });
  }
}

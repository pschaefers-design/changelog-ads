export default async function handler(req, res) {
  const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

  try {
    if (req.method === 'GET') {
      // Offene Followups abrufen
      const response = await fetch(WEB_APP_URL, { method: 'GET' });
      const result = await response.json();
      return res.status(200).json(result);
    }

    if (req.method === 'POST') {
      // Followup-Eintrag aktualisieren
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req.body, type: 'followup' })
      });
      const result = await response.json();
      return res.status(200).json(result);
    }

  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}

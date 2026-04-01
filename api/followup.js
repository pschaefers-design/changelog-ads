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
      // Neues Followup anlegen ODER bestehendes aktualisieren
      // Unterschied: neues Followup hat "followupDate", Update hat "fuId"
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...req.body, type: 'followup' })
      });
      const result = await response.json();
      return res.status(200).json(result);
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}

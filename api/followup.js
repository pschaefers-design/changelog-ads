export default async function handler(req, res) {
  const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

  try {
    if (req.method === "GET") {
      const response = await fetch(WEB_APP_URL, { method: "GET" });
      const text = await response.text();
      console.log("Apps Script GET response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        return res.status(500).json({ success: false, error: "Ungültige Antwort: " + text });
      }
      return res.status(200).json(result);
    }

    if (req.method === "POST") {
      const body = { ...req.body, type: "followup" };
      console.log("Followup POST body:", JSON.stringify(body));

      const response = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      console.log("Apps Script followup response:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        return res.status(500).json({ success: false, error: "Ungültige Antwort: " + text });
      }
      return res.status(200).json(result);
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}

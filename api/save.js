export default async function handler(req, res) {
  const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

  try {
    const response = await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    let result;
    try { result = JSON.parse(text); } catch {
      return res.status(500).json({ success: false, error: text });
    }
    res.status(200).json({ success: true, id: result.id });
  } catch (e) {
    res.status(500).json({ success: false, error: e.toString() });
  }
}

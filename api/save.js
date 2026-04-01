export default async function handler(req, res) {
  const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

  // Sofort mit temporärer ID antworten
  const now = new Date();
  const tempId = "CHG-" + String(now.getFullYear()).slice(2) +
    String(now.getMonth()+1).padStart(2,"0") +
    String(now.getDate()).padStart(2,"0") + "-" +
    String(Math.floor(Math.random()*900)+100);

  res.status(200).json({ success: true, id: tempId });

  // Apps Script im Hintergrund – blockiert das Frontend nicht mehr
  try {
    await fetch(WEB_APP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req.body, tempId }),
    });
  } catch (e) {
    console.error("Apps Script error:", e);
  }
}

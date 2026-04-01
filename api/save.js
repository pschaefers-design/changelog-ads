export default async function handler(req, res) {
  const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

  // Sofort antworten mit einer temporären ID
  const tempId = "CHG-" + new Date().toISOString().slice(0,10).replace(/-/g,"") + "-" + Math.floor(Math.random()*1000);
  res.status(200).json({ success: true, id: tempId });

  // Apps Script im Hintergrund – kein await, kein Blockieren
  fetch(WEB_APP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...req.body, tempId }),
  }).catch(e => console.error("Apps Script error:", e));
}

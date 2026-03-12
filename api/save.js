export default async function handler(req, res) {
  const WEB_APP_URL = process.env.GOOGLE_SCRIPT_URL;

  await fetch(WEB_APP_URL, {
    method: 'POST',
    body: JSON.stringify(req.body)
  });

  res.status(200).json({ success: true });
}

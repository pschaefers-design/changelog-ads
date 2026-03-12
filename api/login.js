export default function handler(req, res) {
  const { password } = req.body;
  const correct = process.env.APP_PASSWORD;

  if (password === correct) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
}

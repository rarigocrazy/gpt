import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  const { initData } = req.body;
  if (!initData) return res.status(400).json({ ok: false, message: "initData missing" });

  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    return res.status(500).json({ ok: false, message: "BOT_TOKEN not set in env" });
  }

  // Telegram validation algorithm
  const secret = require('crypto').createHash('sha256').update(BOT_TOKEN).digest();
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  if (!hash) return res.status(400).json({ ok: false, message: "hash missing from initData" });

  const dataCheckArr = [];
  urlParams.forEach((val, key) => {
    if (key !== "hash") dataCheckArr.push(`${key}=${val}`);
  });
  dataCheckArr.sort();
  const dataCheckString = dataCheckArr.join("\n");

  const hmac = require('crypto').createHmac('sha256', secret).update(dataCheckString).digest('hex');

  if (hmac === hash) {
    return res.json({ ok: true, message: "Valid" });
  } else {
    return res.json({ ok: false, message: "Invalid" });
  }
}

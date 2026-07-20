const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const router = express.Router();
const messagesFile = path.join(__dirname, "..", "data", "messages.json");

function readMessages() {
  if (!fs.existsSync(messagesFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(messagesFile, "utf-8"));
  } catch {
    return [];
  }
}

function saveMessage(entry) {
  const messages = readMessages();
  messages.push(entry);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

async function sendEmail(entry) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return false;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 465,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact Form" <${SMTP_USER}>`,
    to: CONTACT_TO || SMTP_USER,
    replyTo: entry.email,
    subject: `New portfolio message from ${entry.name}`,
    text: entry.message,
  });
  return true;
}

router.post("/", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "name, email, and message are all required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  const entry = {
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    message: String(message).slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  try {
    saveMessage(entry);
    let emailed = false;
    try {
      emailed = await sendEmail(entry);
    } catch (mailErr) {
      console.error("Email delivery failed, message was still saved:", mailErr.message);
    }
    res.status(201).json({ ok: true, emailed });
  } catch (err) {
    console.error("Failed to save contact message:", err);
    res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
});

module.exports = router;

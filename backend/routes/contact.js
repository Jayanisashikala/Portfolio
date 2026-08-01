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

  // Try to save a local copy, but never let this block sending the email —
  // on read-only hosts like Vercel, writing to disk will always fail, and
  // that's fine as long as the email still goes out.
  let saved = false;
  try {
    saveMessage(entry);
    saved = true;
  } catch (saveErr) {
    console.error("Could not save message to disk (continuing anyway):", saveErr.message);
  }

  let emailed = false;
  try {
    emailed = await sendEmail(entry);
  } catch (mailErr) {
    console.error("Email delivery failed:", mailErr.message);
  }

  if (!saved && !emailed) {
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }

  res.status(201).json({ ok: true, saved, emailed });
});

module.exports = router;
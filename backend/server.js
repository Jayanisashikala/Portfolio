require("dotenv").config();
const express = require("express");
const cors = require("cors");

const contactRoute = require("./routes/contact");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : "*",
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "jayani-portfolio-backend" });
});

app.use("/api/contact", contactRoute);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});

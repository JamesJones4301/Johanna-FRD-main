const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();  // load .env
const Donation = require("./models/Donation");

const app = express();
app.use(cors());
app.use(express.json());

// 🔗 Connect MongoDB (securely with .env)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Get all donations
app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new donation
app.post("/api/donations", async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.json({ success: true, donation });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

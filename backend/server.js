// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Donation = require("./models/Donation");
const path = require("path");
const session = require("express-session");

const app = express();

// ---------------- CONFIG ----------------
// ❌ No dotenv, we hardcode values here
const MONGO_URI =
  "mongodb+srv://faransamra45:hzMDmNmSRinNnXiS@cluster0.f9wdtve.mongodb.net/fundraiser?retryWrites=true&w=majority&appName=Cluster0";
const ADMIN_USER = "JamesJones4301";
const ADMIN_PASS = "4301James#";

// Middleware
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: "SuperSecretKey123", // ❗ change for production
    resave: false,
    saveUninitialized: true,
  })
);

// ---------------- MONGODB CONNECTION ----------------
console.log("DEBUG MONGO_URI:", MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------------- API ROUTES ----------------
app.get("/api/donations", async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/donations", async (req, res) => {
  try {
    const { number, name, email, phone, address, amount, paymentMethod, message } = req.body;
    const numbers = Array.isArray(number) ? number : [number];

    // Check if any number already exists
    for (const num of numbers) {
      const existingDonation = await Donation.findOne({ number: { $in: [num] } });
      if (existingDonation) {
        return res.status(400).json({ success: false, error: `Number ${num} is already taken.` });
      }
    }

    const donation = new Donation({
      number: numbers,
      name,
      email,
      phone,
      address,
      amount,
      paymentMethod,
      message: message || "",
    });

    await donation.save();
    res.json({ success: true, donation });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/donations/reset", async (req, res) => {
  try {
    await Donation.deleteMany({});
    res.json({ success: true, message: "All donations have been reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------- LOGIN / ADMIN ----------------
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.authenticated = true;
    return res.redirect("/admin.html");
  }

  res.send("Invalid credentials. <a href='/login.html'>Try again</a>");
});

app.get("/admin", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "../frontend/admin.html"));
  } else {
    res.redirect("/login.html");
  }
});

// ---------------- FRONTEND ----------------
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ---------------- START SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

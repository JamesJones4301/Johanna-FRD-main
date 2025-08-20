// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Donation = require("./models/Donation");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const session = require("express-session");

app.use(session({
  secret: "SuperSecretKey123", // change this in production
  resave: false,
  saveUninitialized: true
}));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => {
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
      message: message || ''
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

  if (username === "JamesJones4301" && password === "4301James#") {
    req.session.authenticated = true;
    return res.redirect("/admin");
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

app.get("/donate", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/donate.html"));
});

// ---------------- FRONTEND ----------------
if (process.env.NODE_ENV === "production") {
  // Serve React build in production
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
} else {
  // Serve raw HTML files in development
  app.use(express.static(path.join(__dirname, "../frontend")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
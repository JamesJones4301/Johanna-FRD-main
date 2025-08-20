// backend/models/Donation.js
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  number: { type: [Number], required: true }, // Changed to array to support multiple numbers
  name: { type: String, required: true },
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Donation", donationSchema);

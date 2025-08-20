const express = require("express");
const app = express();

app.use(express.json());

app.get("/test", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/", (req, res) => {
  res.send("Hello World! Server is running.");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Test server running on http://localhost:${PORT}`));

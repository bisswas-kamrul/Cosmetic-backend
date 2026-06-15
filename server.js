require("dotenv").config();
const express = require("express");
const DBconection = require("./ConfigFloder/DBConection");
const router = require("./routes");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["https://cosmetic-frontend-theta.vercel.app", "https://cosmetic-dashboard-rho.vercel.app"];

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required");
}

// middleware
app.use(express.json());

// static folder
app.use("/uploads", express.static("UploaderFolder"));

// fondent with bacend pages connect korte cros npm lage
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// test route
app.get("/", (req, res) => {
  res.send("Server Running ");
});

// routes
app.use(router);

// DB connect
DBconection();

// server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

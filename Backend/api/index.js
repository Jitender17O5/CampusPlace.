const app = require("../src/app");
const connectDB = require("../src/config/db");
const mongoose = require("mongoose");

module.exports = async (req, res) => {
  try {
    console.log(
      "[DB DEBUG] Before connection:",
      mongoose.connection.readyState
    );

    await connectDB();

    console.log(
      "[DB DEBUG] After connection:",
      mongoose.connection.readyState
    );

    return app(req, res);

  } catch (error) {
    console.error("[DB DEBUG] Connection failed:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
};
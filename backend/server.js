const express = require("express");
require("dotenv").config();
const { sequelize, UserResponse } = require("./models/UserResponse");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Root route
app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
});

// Submit response route
app.post("/api/submit-response", async (req, res) => {
    try {
        const { name, email, responses } = req.body;

        if (!name || !email || !Array.isArray(responses) || !responses.every(row => Array.isArray(row))) {
            return res.status(400).json({ success: false, message: "Invalid request format. 'responses' must be a 2D array." });
        }

        const newUser = await UserResponse.create({ name, email, responses });
        res.json({ success: true, message: "Data successfully saved", data: newUser });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// Get response by email
app.get("/api/get-response/:email", async (req, res) => {
    try {
        const user = await UserResponse.findOne({ where: { email: req.params.email } });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

module.exports = app; // ✅ Export app for serverless function

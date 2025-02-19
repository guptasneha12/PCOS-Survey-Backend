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
    return res.json({ message: "Server is running!" });
});

// Submit response route
app.post("/api/submit-response", async (req, res) => {
    console.log(req.body);

    const { name, email, responses } = req.body;

    if (!name || !email || !Array.isArray(responses) || !responses.every(row => Array.isArray(row))) {
        return res.status(400).json({
            success: false,
            message: "Invalid request format. 'responses' must be a 2D array.",
        });
    }

    try {
        const newUser = await UserResponse.create({ name, email, responses });
        res.json({ success: true, message: "Data successfully saved", data: newUser });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// Get response by email route
app.get("/api/get-response/:email", async (req, res) => {
    const email = req.params.email;

    try {
        const user = await UserResponse.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                responses: user.responses, // Already parsed as a 2D array
            },
        });
    } catch (err) {
        console.error("SQL Error:", err.message);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

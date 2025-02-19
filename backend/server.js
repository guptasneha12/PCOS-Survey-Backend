const express = require("express");
require("dotenv").config();
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());


// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL database");
    }
});

app.get("/",(req,res)=>{
    return res.json({
        message:"Good to go",
    })
})

// Submit response route
app.post("/api/submit-response", (req, res) => {
    console.log(req.body);

    const { name, email, responses } = req.body;

    if (!name || !email || !Array.isArray(responses)) {
        return res.status(400).json({
            success: false,
            message: "Invalid request format. 'responses' must be an array."
        });
    }

    let responsesJSON;
    try {
        responsesJSON = JSON.stringify(responses);
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Error serializing responses"
        });
    }

    const query = "INSERT INTO users_responses (name, email, responses) VALUES (?, ?, ?)";

    db.query(query, [name, email, responsesJSON], (err, result) => {
        if (err) {
            console.error("SQL Error:", err.sqlMessage);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        res.json({
            success: true,
            message: "Data successfully saved"
        });
    });
});

// Get response by email route
app.get("/api/get-response/:email", (req, res) => {
    const email = req.params.email;

    const query = "SELECT * FROM users_responses WHERE email = ?";

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("SQL Error:", err.sqlMessage);
            return res.status(500).json({
                success: false,
                msg: "Database error"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                msg: "User not found"
            });
        }

        let responsesData;
        try {
            responsesData = JSON.parse(results[0].responses);
            if (!Array.isArray(responsesData)) {
                throw new Error("Parsed responses is not an array");
            }
        } catch (error) {
            console.error("Error parsing responses:", error);
            return res.status(500).json({
                success: false,
                msg: "Error parsing responses JSON"
            });
        }

        res.json({
            success: true,
            data: {
                id: results[0].id,
                name: results[0].name,
                email: results[0].email,
                responses: responsesData
            }
        });
    });
});

// Export Express app as a serverless function
module.exports = app;
app.listen(5000,()=>{
    console.log("server is running");
})
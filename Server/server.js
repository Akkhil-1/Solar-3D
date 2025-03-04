const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const fs = require("fs");

require("dotenv").config();

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(fs.readFileSync("firebaseServiceKey.json"));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://your-project-id.firebaseio.com"
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// Save Solar System Config
app.post("/save", async (req, res) => {
    try {
        await db.collection("solarConfigs").doc("latestConfig").set(req.body);
        res.status(201).send("Configuration Saved");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Load Solar System Config
app.get("/load", async (req, res) => {
    try {
        const doc = await db.collection("solarConfigs").doc("latestConfig").get();
        if (doc.exists) {
            res.json(doc.data());
        } else {
            res.status(404).send("No Configuration Found");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

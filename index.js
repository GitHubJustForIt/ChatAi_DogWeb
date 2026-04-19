const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
app.use(express.json());

// Load rules synchronously at startup or wrap in a more robust handler
let rules = "";
try {
    rules = fs.readFileSync("./rules.txt", "utf8");
} catch (err) {
    console.error("Could not load rules.txt:", err.message);
    rules = "You are a helpful assistant."; // Fallback
}

app.get("/", (req, res) => {
    res.send("Server läuft!");
});

app.post("/chat", async (req, res) => {
    const msg = req.body.message;

    if (!msg) {
        return res.status(400).send("No message provided");
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/auto", // 'auto' or your specific model
                messages: [
                    { role: "system", content: rules },
                    { role: "user", content: msg }
                ]
            })
        });

        const data = await response.json();

        // Check if the API returned an error or unexpected format
        if (!data.choices || data.choices.length === 0) {
            console.error("OpenRouter Error:", data);
            return res.status(500).send("Fehler bei KI 😢");
        }

        res.send(data.choices[0].message.content);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Interner Serverfehler");
    }
});

app.listen(3000, () => console.log("Server läuft auf Port 3000 🚀"));

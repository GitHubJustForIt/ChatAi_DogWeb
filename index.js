const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();
app.use(express.json());

const path = require("path");

let rules = "";
const rulesPath = path.join(__dirname, "rules.txt");

if (fs.existsSync(rulesPath)) {
    rules = fs.readFileSync(rulesPath, "utf8");
    console.log("✅ rules.txt erfolgreich geladen");
} else {
    console.warn("⚠️ rules.txt wurde nicht gefunden! Benutze Standard-Prompt.");
    rules = "Du bist ein hilfreicher Assistent."; 
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

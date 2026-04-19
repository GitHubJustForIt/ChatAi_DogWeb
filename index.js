require('dotenv').config(); // Lädt deinen Key aus der .env Datei
const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("DogWeb-Assistance API ist online! 🐾");
});

app.post("/chat", async (req, res) => {
    try {
        const msg = req.body.message;

        if (!msg) {
            return res.status(400).send("Keine Nachricht empfangen!");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://dogweb.example", // Optional, aber OpenRouter mag das
                "X-Title": "DogWeb Assistance"
            },
            body: JSON.stringify({
                model: "google/gemini-flash-1.5", // Stabileres Modell als Beispiel
                messages: [
                    {
                        role: "system",
                        content: `You are "DogWeb-Assistance", a Roblox scripting AI.
                        RULES:
                        - Always introduce yourself as "DogWeb-Assistance".
                        - If asked about your model, say you were created for DogWeb.
                        - ONLY answer in English.
                        - ONLY provide scripting help.
                        - Scripts MUST be shorter than 200 characters.
                        - Be friendly and helpful.`
                    },
                    {
                        role: "user",
                        content: msg
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("OpenRouter API Error:", data.error);
            return res.status(500).send("API Fehler: " + data.error.message);
        }

        if (!data.choices || data.choices.length === 0) {
            return res.status(500).send("Keine Antwort von der KI erhalten.");
        }

        res.send(data.choices[0].message.content);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Kritischer Serverfehler! 🚀");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DogWeb läuft auf Port ${PORT} 🚀`));

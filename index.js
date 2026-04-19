const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// Startseite
app.get("/", (req, res) => {
    res.send("Server läuft!");
});

// Chat-Endpunkt
app.post("/chat", async (req, res) => {
    try {
        const msg = req.body.message;

        // Prüfen, ob überhaupt eine Nachricht geschickt wurde
        if (!msg) {
            return res.status(400).send("Keine Nachricht empfangen!");
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.KEY}`, // Sicherstellen, dass KEY gesetzt ist
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/elephant-alpha", // Prüfe, ob das Modell existiert
                messages: [
                    {
                        role: "system",
                        content: "Du bist ein lustiger Roblox NPC 😎"
                    },
                    {
                        role: "user",
                        content: msg
                    }
                ]
            })
        });

        const data = await response.json();

        // Debugging: Falls OpenRouter einen Fehler schickt (z.B. 401 Unauthorized)
        if (!data.choices || data.error) {
            console.error("OpenRouter Error:", data);
            return res.status(500).send("KI-Fehler: " + (data.error?.message || "Unbekannt"));
        }

        res.send(data.choices[0].message.content);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Interner Serverfehler 😢");
    }
});

app.listen(3000, () => console.log("Server läuft auf http://localhost:3000 🚀"));

const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs"); // Modul zum Lesen von Dateien hinzufügen
const path = require("path");

const app = express();
app.use(express.json());

// Funktion zum Laden der Regeln
function getRules() {
    try {
        // Liest die rules.txt im selben Verzeichnis aus
        return fs.readFileSync(path.join(__dirname, "rules.txt"), "utf8");
    } catch (err) {
        console.error("Fehler beim Lesen der rules.txt:", err);
        return ""; // Falls Datei fehlt, wird ein leerer String genutzt
    }
}

// Startseite
app.get("/", (req, res) => {
    res.send("Server läuft!");
});

// Chat-Endpunkt
app.post("/chat", async (req, res) => {
    try {
        const msg = req.body.message;

        if (!msg) {
            return res.status(400).send("Keine Nachricht empfangen!");
        }

        // Regeln dynamisch bei jedem Request laden (oder einmalig oben speichern)
        const rules = getRules();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemma-4-26b-a4b-it:free",
                messages: [
                    {
                        role: "system",
                        // Wir kombinieren den NPC-Charakter mit den Regeln aus der Datei
                        content: `Du bist ein lustiger Roblox NPC 😎. Hier sind deine Verhaltensregeln: ${rules}`
                    },
                    {
                        role: "user",
                        content: msg
                    }
                ]
            })
        });

        const data = await response.json();

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

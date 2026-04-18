const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
    const msg = req.body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + process.env.KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: "Du bist ein Roblox NPC. Antworte kurz und cool."
                },
                {
                    role: "user",
                    content: msg
                }
            ]
        })
    });

    const data = await response.json();
    res.send(data.choices[0].message.content);
});

app.listen(3000, () => console.log("läuft 🚀"));

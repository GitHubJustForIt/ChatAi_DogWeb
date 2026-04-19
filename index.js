const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");

let rules = "";

async function loadRules() {
    rules = fs.readFileSync("./rules.txt", "utf8");
}

loadRules();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server läuft!");
   
});

app.post("/chat", async (req, res) => {
    const msg = req.body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + process.env.KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "openrouter/elephant-alpha",
            messages: [
                {
                    role: "system",
                    content: rules
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

    const data = await response.json();

    // Debug falls Fehler
    if (!data.choices) {
        console.log(data);
        return res.send("Fehler bei KI 😢");
    }

    res.send(data.choices[0].message.content);
});

app.listen(3000, () => console.log("läuft 🚀"));

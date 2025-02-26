require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

// Ensure environment variables are loaded
if (!process.env.OPENAI_API_KEY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment variables. Check your .env file.");
    process.exit(1);
}

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API Route: Generate AI Email
app.post('/api/generate', async (req, res) => {
    const { userId, emailType, clientName } = req.body;

    if (!userId || !emailType || !clientName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const prompt = `Write a professional ${emailType} email for a client named ${clientName}.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",  // Use "gpt-4o" or "gpt-3.5-turbo"
            messages: [
                { role: "system", content: "You are an AI email generator." },
                { role: "user", content: prompt }
            ],
            max_tokens: 200
        });

        // Ensure OpenAI response is valid
        if (!response || !response.choices || response.choices.length === 0) {
            throw new Error("Invalid response from OpenAI");
        }

        const generatedEmail = response.choices[0].message.content.trim();

        // Ensure userId is a valid UUID before inserting
        if (!userId || userId.length !== 36) {
            return res.status(400).json({ error: "Invalid userId format. Must be a UUID." });
        }

        const { data, error } = await supabase.from('emails').insert([
            { user_id: userId, subject: `${emailType} Email`, body: generatedEmail, status: "pending_review" }
        ]);

        if (error) {
            console.error("Supabase Insert Error:", error.message);
            return res.status(500).json({ error: `Database Error: ${error.message}` });
        }

        if (error) throw new Error(`Supabase Insert Error: ${error.message}`);

        res.json({ subject: `${emailType} Email`, body: generatedEmail });
    } catch (error) {
        console.error("Error generating email:", error.message);
        res.status(500).json({ error: "Error generating email", details: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

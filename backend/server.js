require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(cors());

// Ensure environment variables are loaded
const REQUIRED_ENV_VARS = ["OPENAI_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}. Check your .env file.`);
        process.exit(1);
    }
});

console.log("✅ Supabase URL:", process.env.SUPABASE_URL);  // Debugging
console.log("✅ Supabase Key Loaded:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// OpenAI setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * API Route: Register a new user
 */
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) return res.status(400).json({ error: error.message });

        res.status(201).json({ message: "User registered successfully", user: data.user });
    } catch (err) {
        console.error("Registration error:", err.message);
        res.status(500).json({ error: "Server error during registration" });
    }
});

/**
 * API Route: User Login
 */
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) return res.status(401).json({ error: "Invalid credentials" });

        res.status(200).json({ token: data.session.access_token });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ error: "Server error during login" });
    }
});

/**
 * ✉️ API Route: Generate AI Email
 */
app.post('/api/generate', async (req, res) => {
    const { userId, emailType, clientName } = req.body;

    if (!userId || !emailType || !clientName) {
        console.error("Request failed: Missing required fields:", { userId, emailType, clientName });
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const prompt = `Write a professional ${emailType} email for a client named ${clientName}.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "You are an AI email generator." },
                { role: "user", content: prompt }
            ],
            max_tokens: 200
        });

        // Ensure OpenAI response is valid
        if (!response || !response.choices || response.choices.length === 0 || !response.choices[0]?.message?.content) {
            throw new Error("Invalid response from OpenAI API");
        }

        const generatedEmail = response.choices[0].message.content.trim();

        // Ensure userId is a valid UUID before inserting
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            console.error("Invalid userId format:", userId);
            return res.status(400).json({ error: "Invalid userId format. Must be a UUID." });
        }

        const { data, error } = await supabase.from('emails').insert([
            { user_id: userId, subject: `${emailType} Email`, body: generatedEmail, status: "pending_review" }
        ]);

        if (error) {
            console.error("Supabase Insert Error:", error.message);
            return res.status(500).json({ error: `Database Error: ${error.message}` });
        }

        res.json({ subject: `${emailType} Email`, body: generatedEmail });
    } catch (error) {
        console.error("Error generating email:", error.message);
        res.status(500).json({ error: "Error generating email", details: error.message });
    }
});

/**
 * Root health check endpoint
 */
app.get("/", (req, res) => {
    res.status(200).send("✅ Server is running!");
});

// Only start the server if not in test mode
if (process.env.NODE_ENV !== "test") {
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
}

/**
 * Protected Route Example
 */
app.get('/api/protected-route', async (req, res) => {
    const authHeader = req.headers.authorisation;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorised: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({ error: "Unauthorised: Invalid token" });
    }

    res.json({ message: "Access granted", user: data.user });
});

module.exports = app; // Export for Jest tests

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

// ---------- Middleware ----------
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ---------- Supabase Client ----------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase env vars missing");
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey
);

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ---------- Save Candidate ----------
app.post("/save-candidate", async (req, res) => {
  try {
    console.log("📥 Incoming request body:", req.body);

    const payload = {
      name: req.body.name || "unknown",
      email: req.body.email || "na",
      phone: req.body.phone || "na",
      resume_url: req.body.resume_url || null,
      score: Number(req.body.score) || 0
    };

    console.log("📦 Payload to insert:", payload);

    const { data, error } = await supabase
      .from("Candidates")
      .insert([payload]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log("✅ Insert successful:", data);
    return res.json({ success: true });

  } catch (err) {
    console.error("🔥 Server crash:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ---------- Export for Vercel ----------
export default app;

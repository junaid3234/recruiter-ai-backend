import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------------- SUPABASE ---------------- */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log("🔑 Supabase URL exists:", !!SUPABASE_URL);
console.log("🔑 Service key valid:", SUPABASE_SERVICE_KEY?.startsWith("sb_secret_"));

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running");
});

/* ---------------- SAVE CANDIDATE ---------------- */
app.post("/save-candidate", async (req, res) => {
  console.log("🚀 /save-candidate HIT");
  console.log("📥 Raw body:", req.body);

  try {
    const payload = {
      name: req.body.name ?? "unknown",
      email: req.body.email ?? "na",
      phone: req.body.phone ?? "na",
      resume_url: req.body.resume_url ?? null,
      score: Number(req.body.score) || 0
    };

    console.log("📦 Insert payload:", payload);

    const { data, error } = await supabase
      .from("Candidates")
      .insert([payload])
      .select();

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log("✅ INSERT SUCCESS:", data);
    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("🔥 SERVER CRASH:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------------- EXPORT ---------------- */
export default app;

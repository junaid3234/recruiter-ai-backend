import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/save-candidate", async (req, res) => {
  try {
    console.log("Incoming payload:", req.body);

    const payload = {
      name: req.body.name || "unknown",
      email: req.body.email || "na",
      phone: req.body.phone || "na",
      resume_url: req.body.resume_url || null,
      score: Number(req.body.score) || 0
    };

    const { data, error } = await supabase
      .from("Candidates")
      .insert([payload]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log("Inserted row:", data);
    return res.json({ success: true });

  } catch (err) {
    console.error("Backend crash:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default app;
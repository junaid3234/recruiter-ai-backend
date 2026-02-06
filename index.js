import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

/* ---------- Middleware ---------- */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ---------- Supabase ---------- */
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

console.log("Supabase URL exists:", !!SUPABASE_URL);
console.log("Service key valid:", SUPABASE_SERVICE_KEY?.startsWith("sb_secret_"));

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY
);

/* ---------- Health Check ---------- */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running");
});

/* ---------- Save Candidate ---------- */
app.post("/save-candidate", async (req, res) => {
  console.log("SAVE-CANDIDATE HIT");
  console.log("Incoming body:", req.body);

  try {
    const payload = {
      name: req.body.name ?? "unknown",
      email: req.body.email ?? "na",
      phone: req.body.phone ?? "na",
      resume_url: req.body.resume_url ?? null,
      score: Number(req.body.score) || 0
    };

    const { data, error } = await supabase
      .from("Candidates")
      .insert([payload])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    console.log("Insert success:", data);
    return res.status(200).json({
      success: true,
      data
    });

  } catch (err) {
    console.error("Server crash:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------- Get All Candidates ---------- */
app.get("/candidates", async (req, res) => {
  console.log("GET-CANDIDATES HIT");

  try {
    const { data, error } = await supabase
      .from("Candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("Server crash:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------- Delete Candidate (NEW) ---------- */
app.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  console.log("DELETE HIT:", id);

  try {
    const { error } = await supabase
      .from("Candidates")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Candidate deleted"
    });

  } catch (err) {
    console.error("Server crash:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/* ---------- Export for Vercel ---------- */
export default app;

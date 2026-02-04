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
    console.log("Incoming data:", req.body);

    const { name, email, phone, resume_url, score } = req.body;

    const { data, error } = await supabase
      .from("Candidates") // ⚠️ change if needed
      .insert([{ name, email, phone, resume_url, score }]);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Server crash:", err);
    res.status(500).json({ error: err.message });
  }
});

export default app;
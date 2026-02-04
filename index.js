import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.post("/save-candidate", async (req, res) => {
  const { name, email, phone, resume_url, score } = req.body;

  const { error } = await supabase.from("candidates").insert([
    { name, email, phone, resume_url, score }
  ]);

  if (error) {
    return res.status(400).json({ error });
  }

  res.json({ success: true });
});

export default app;

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/* Health */
app.get("/", (req,res)=>{
  res.send("Backend is running");
});

/* Save Candidate */
app.post("/save-candidate", async (req,res)=>{
  try{
    const payload={
      name:req.body.name ?? "unknown",
      email:req.body.email ?? "na",
      phone:req.body.phone ?? "na",
      resume_url:req.body.resume_url ?? null,
      score:Number(req.body.score)||0,
      status:"New",
      scanned_at:req.body.scanned_at ?? new Date().toISOString(),
      deleted_at:null
    };

    const {data,error}=await supabase
      .from("Candidates")
      .insert([payload])
      .select();

    if(error) throw error;

    res.json({success:true,data});
  }catch(err){
    res.status(500).json({error:err.message});
  }
});

/* Active */
app.get("/candidates", async(req,res)=>{
  const {data,error}=await supabase
    .from("Candidates")
    .select("*")
    .is("deleted_at",null)
    .order("scanned_at",{ascending:false});

  if(error) return res.status(500).json(error);
  res.json(data);
});

/* Deleted */
app.get("/deleted", async(req,res)=>{
  const {data,error}=await supabase
    .from("Candidates")
    .select("*")
    .not("deleted_at","is",null)
    .order("deleted_at",{ascending:false});

  if(error) return res.status(500).json(error);
  res.json(data);
});

/* Bulk Delete */
app.delete("/delete", async(req,res)=>{
  const ids=req.body.ids;

  await supabase
    .from("Candidates")
    .update({deleted_at:new Date().toISOString()})
    .in("id",ids);

  res.json({success:true});
});

/* Restore */
app.put("/restore", async(req,res)=>{
  const ids=req.body.ids;

  await supabase
    .from("Candidates")
    .update({deleted_at:null})
    .in("id",ids);

  res.json({success:true});
});

/* Permanent Delete */
app.delete("/permanent", async(req,res)=>{
  const ids=req.body.ids;

  await supabase
    .from("Candidates")
    .delete()
    .in("id",ids);

  res.json({success:true});
});

export default app;

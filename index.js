import express from "express";
import { exec } from "child_process";

const app = express();
app.use(express.json());

// TEST ENDPOINT
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "FFmpeg API running" });
});

// FFmpeg TEST
app.get("/ffmpeg", (req, res) => {
  exec("ffmpeg -version", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ ffmpeg: stdout.split("\n")[0] });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

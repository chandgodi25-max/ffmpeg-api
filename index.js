import express from "express";
import { execFile } from "child_process";
import ffmpegPath from "ffmpeg-static";

const app = express();
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({ status: "OK", message: "FFmpeg API running" });
});

app.get("/ffmpeg", (req, res) => {
  execFile(ffmpegPath, ["-version"], (err, stdout) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ ffmpeg: stdout.split("\n")[0] });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

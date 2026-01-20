const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Health check – aby to nezaspalo
app.get('/health', (req, res) => res.send('OK'));

// Overlay endpoint
app.post('/overlay', async (req, res) => {
  const { videoUrl, text } = req.body;
  if (!videoUrl || !text) return res.status(400).send('Chýba videoUrl alebo text');

  const inputPath = '/tmp/input.mp4';
  const outputPath = '/tmp/output.mp4';

  try {
    // Stiahni video
    const response = await axios({ method: 'GET', url: videoUrl, responseType: 'stream' });
    const writer = fs.createWriteStream(inputPath);
    response.data.pipe(writer);
    await new Promise(resolve => writer.on('finish', resolve));

    // FFmpeg overlay
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions('-vf', `drawtext=text='${text}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2`)
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Pošli späť ako buffer
    const buffer = await fs.readFile(outputPath);
    res.set('Content-Type', 'video/mp4');
    res.send(buffer);

  } catch (err) {
    res.status(500).send('Chyba: ' + err.message);
  } finally {
    await fs.remove(inputPath);
    await fs.remove(outputPath);
  }
});

app.listen(PORT, () => console.log(`Server beží na porte ${PORT}`));

const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send(`
    <h2>Enter YouTube Video ID:</h2>
    <form method="GET" action="/video">
      <input type="text" name="id" placeholder="e.g. dQw4w9WgXcQ" required />
      <button type="submit">Stream</button>
    </form>
  `);
});

// Endpoint to stream the video
app.get('/video', async (req, res) => {
    const videoId = req.query.id;

    if (!videoId) {
        return res.status(400).send('Missing video ID');
    }

    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (videoId.includes('youtube.com')) {
        url = videoId;
    }

    try {
        const info = await ytdl.getInfo(url);

        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

        res.header('Content-Disposition', `inline; filename="${videoId}.mp4"`);
        res.header('Content-Type', 'video/mp4');

        ytdl(url, { format }).pipe(res);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to stream video.');
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
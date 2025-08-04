const express = require('express');
// const ytdl = require('ytdl-core');
const app = express();

const PORT = process.env.PORT || 10000;

app.use((req, res, next) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=5, max=1000');
    next();
});

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
        return res.status(400).json({ error: 'video id not found' });
    }

    let url = `https://www.youtube.com/watch?v=${videoId}`;
    //if (videoId.includes('youtube.com')) {
    //    url = videoId;
    //}

    try {
        /*const info = await ytdl.getInfo(url);

        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });

        // res.header('Content-Disposition', `inline; filename="${videoId}.mp4"`);
        // res.header('Content-Type', 'video/mp4');

        // ytdl(url, { format }).pipe(res);
        if (!format || !format.url) {
            return res.status(404).json({ error: 'Suitable format not found' });
        }
        return res.json({
            url: format.url,
            title: info.videoDetails.title,
            author: info.videoDetails.author.name,
            lengthSeconds: info.videoDetails.lengthSeconds,
        });
        */
        const youtubedl = require('youtube-dl-exec')

        const output = await youtubedl(url, {
            dumpSingleJson: true,
            preferFreeFormats: true,
            noCheckCertificates: true,
            noWarnings: true,
            format: 'best[ext=mp4]',
            addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36']
        });

        return res.json({
            id: output?.id,
            title: output?.title,
            url: output?.url,
            channel_id: output?.channel_id,
            duration: output?.duration,
            view_count: output?.view_count,
            like_count: output?.like_count,
            is_live: output?.is_live,
            duration_string: output?.duration_string,
        });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Failed to retrieve video info', msg: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`✅ Server is running at http://serverhost:${PORT}`);
});

server.keepAliveTimeout = 65 * 1000;
server.headersTimeout = 66 * 1000;
server.setTimeout(10 * 60 * 1000);
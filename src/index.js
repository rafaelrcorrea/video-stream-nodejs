// const http = require('http');
// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.end('Hello world!');
// });
// server.listen(3000, () => {
//     console.log('Server running');
// });

const express = require('express');
const fs = require('fs');
const app = express();

//routes
app.get('/', (req, res) => {
    const htmlPath = 'src/assets/index.html';
    fs.readFile(htmlPath, (err, file) => {
        if (err) return res.sendStatus(404);
        res.write(file);
        res.end();
    });
    
})

app.get('/content', (req, res) => {
    // const videoPath = 'src/assets/video.mp4';
    const videoPath = 'src/assets/video.mp4';
    const videoMIME = 'video/mp4';
    fs.stat(videoPath, (err, stats) => {
        if(err) {
            return res.sendStatus(500);
        }
        console.log(err);
        const fileSize = stats.size;
        const { range } = req.headers;
        if (range) {
            console.log(range);
            const arrRange = range.replace(/bytes=/, '').split('-');
            const startRange = parseInt(arrRange[0], 10);
            const endRange = arrRange[1] ? parseInt(arrRange[1], 10) : fileSize - 1
            const readStream = fs.createReadStream(videoPath, { start: startRange, end: endRange });
            const header = {
                'Content-Range': `bytes ${startRange}-${endRange}/${fileSize}`,
                'Accept-Range': `bytes`,
                'Content-Length': (endRange-startRange)+1,
                'Content-Type': videoMIME
            }
            res.writeHead(206, header);
            readStream.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': `${fileSize}`,
                'Content-Type': videoMIME
            });
            fs.createReadStream(videoPath).pipe(res);
        }
    })
})

app.listen(process.env.PORT || 3000);
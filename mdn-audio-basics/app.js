const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const fs = require('fs');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const handleWs = (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Server: ${message}`);
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
}



const handleWsAudio = (ws) => {
    console.log('wsaudio : New client connected');
    fs.mkdirSync('public/ws', { recursive: true });
    ws.on('message', (message) => {
      try {
      console.log(`wsaudio : Received message of length ${message.length}`);
      ws.send(`wsaudio : Received message of length ${message.length}`);
      const timestamp = new Date().getTime();
      const filename = `public/ws/audio_${timestamp}.webm`;
      fs.writeFile(filename, message, (err) => {
        if (err) {
            console.error('Error saving audio chunk:', err);
          } else {
              console.log(`Audio chunk saved as ${filename}`);
          }
        });
      } catch (error) {
        console.error('Error saving audio:', error);
        ws.send('Error saving audio file');
      }
    });
  
    ws.on('error', (error) => {
      console.error('wsaudio : WebSocket error:', error);
    });
  
    ws.on('close', () => {
      console.log('wsaudio : Client disconnected');
    });
  }

app.prepare().then(() => {
    const server = createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    const wss = new WebSocket.Server({ port: 3001 });
    const wsaudio = new WebSocket.Server({ port: 3002 });

    wss.on('connection', handleWs);
    wsaudio.on('connection', handleWsAudio);

    server.listen(3000, (err) => {
        if (err) throw err;
        console.log('> Ready on http://localhost:3000');
    });
});
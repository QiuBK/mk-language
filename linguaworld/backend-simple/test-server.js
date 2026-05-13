const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

const server = app.listen(8080, '0.0.0.0', () => {
  console.log('Test server running on 8080');
  
  setInterval(() => {
    console.log('Server still running...', new Date().toISOString());
  }, 3000);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close();
  process.exit(0);
});

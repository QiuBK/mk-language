const { spawn } = require('child_process');

console.log('Starting LinguaWorld Backend Server...');

let server;

function startServer() {
  server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    detached: false
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}, restarting...`);
    setTimeout(startServer, 2000);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    setTimeout(startServer, 2000);
  });
}

startServer();

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  if (server) {
    server.kill();
  }
  process.exit();
});

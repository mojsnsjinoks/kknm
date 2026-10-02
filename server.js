/**
 * CRS DENIM WAREHOUSE SCANNER & INVENTORY DASHBOARD
 * Zero-Dependency Node.js HTTP Server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

// Helper: Get local network IP addresses
function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ name, address: net.address });
      }
    }
  }
  return addresses;
}

// Request Handler
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Normalize request path
  let safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(PUBLIC_DIR, safePath);

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 File Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`500 Server Error: ${error.code}`);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        });
        res.end(content, 'utf-8');
      }
    });
  });
});

// Start Server
server.listen(PORT, () => {
  const ips = getNetworkIPs();

  console.log('\n==================================================');
  console.log('  👖 CRS DENIM WAREHOUSE SCANNER SERVER RUNNING');
  console.log('==================================================');
  console.log(`  Local URL:    http://localhost:${PORT}`);

  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`  Network URL:  http://${ip.address}:${PORT} (${ip.name})`);
    });
  } else {
    console.log('  Network URL:  No external IP found');
  }

  console.log('==================================================');
  console.log('  💡 Mobile Camera Tip:');
  console.log('  - Chrome/Safari require localhost or HTTPS for camera access.');
  console.log('  - On desktop or localhost mobile test, open http://localhost:' + PORT);
  console.log('==================================================\n');
});

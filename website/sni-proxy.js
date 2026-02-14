const http = require('http');
const https = require('https');
const fs = require('fs');
const tls = require('tls');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});

// Load certificates
const floralCerts = {
  key: fs.readFileSync('/etc/letsencrypt/live/floral.monster/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/floral.monster/fullchain.pem')
};

const clawedCerts = {
  key: fs.readFileSync('/etc/letsencrypt/live/clawed.monster/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/clawed.monster/fullchain.pem')
};

const secureContexts = {
  'floral.monster': tls.createSecureContext(floralCerts),
  'lib.floral.monster': tls.createSecureContext(floralCerts),
  'pipe.floral.monster': tls.createSecureContext(floralCerts),
  'clawed.monster': tls.createSecureContext(clawedCerts),
  'www.clawed.monster': tls.createSecureContext(clawedCerts)
};

const routing = {
  'floral.monster': 'http://127.0.0.1:3000',
  'lib.floral.monster': 'http://127.0.0.1:3001',
  'pipe.floral.monster': 'http://127.0.0.1:3002',
  'clawed.monster': 'http://127.0.0.1:3003',
  'www.clawed.monster': 'http://127.0.0.1:3003'
};

const options = {
  SNICallback: (domain, cb) => {
    if (secureContexts[domain]) {
      cb(null, secureContexts[domain]);
    } else {
      cb(null, secureContexts['floral.monster']);
    }
  },
  key: floralCerts.key,
  cert: floralCerts.cert
};

// HTTPS Server
const server = https.createServer(options, (req, res) => {
  const host = req.headers.host;
  const target = routing[host];

  console.log(`[${new Date().toISOString()}] HTTPS Request for ${host}${req.url} -> ${target || 'NOT FOUND'}`);

  if (target) {
    proxy.web(req, res, { target });
  } else {
    res.statusCode = 404;
    res.end('Sovereign Hub (SSL): Host not found');
  }
});

// HTTP to HTTPS Redirect
const httpRedirect = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] HTTP Redirect for ${req.headers.host}${req.url}`);
  res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
  res.end();
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy Error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy Error');
});

console.log('🔱 Sovereign SSL SNI Proxy quickened on port 443...');
server.listen(443);
httpRedirect.listen(80);

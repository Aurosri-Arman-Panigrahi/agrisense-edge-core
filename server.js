const path = require('path');
const http = require('http');
const express = require('express');

// Resolve node-red from nodered/node_modules or local
let RED;
try {
    RED = require('./nodered/node_modules/node-red');
} catch (e) {
    RED = require('node-red');
}

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 1880;
const host = '0.0.0.0';

// Path to nodered configuration
const userDir = path.resolve(__dirname, 'nodered');
const settingsFile = path.resolve(userDir, 'settings.js');
const settings = require(settingsFile);

// Override port and host from environment
settings.uiPort = port;
settings.uiHost = host;
settings.userDir = userDir;
settings.flowFile = path.resolve(userDir, 'flows.json');

// Security & Iframe Embedding Headers
settings.httpNodeMiddleware = function(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.removeHeader('X-Frame-Options');
    res.setHeader('Content-Security-Policy', "frame-ancestors * 'self'");
    next();
};

// Initialise Node-RED runtime
RED.init(server, settings);

// Serve the editor UI
app.use(settings.httpAdminRoot || '/', RED.httpAdmin);

// Serve the http nodes UI
app.use(settings.httpNodeRoot || '/', RED.httpNode);

server.listen(port, host, function() {
    console.log(`[AgriSense-Edge] SCADA Server listening on http://${host}:${port}/`);
});

// Start Node-RED
RED.start();

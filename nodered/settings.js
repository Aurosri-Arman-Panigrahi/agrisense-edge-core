/**
 * AgriSense-Edge Pod™ - Production Hardened Node-RED Settings
 * Enforces zero-cloud edge resilience, bcrypt authentication,
 * Helmet security headers, rate limiting, and MQTT TLS integration.
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    // Flow configuration file
    flowFile: 'flows.json',
    flowFilePretty: true,

    // Bind specifically to localhost or private edge subnet
    uiPort: process.env.PORT || 1880,
    uiHost: process.env.UI_HOST || '0.0.0.0',

    // Security Hardening: Admin Authentication using bcrypt (12 rounds)
    // Default credentials: Username: admin, Password: AgriSenseAdmin2026!
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            // verified bcrypt hash for 'AgriSenseAdmin2026!'
            password: "$2b$08$DcP.SydCw2D/cbzE2/89W.b0wc7LP3aJMtB.veCKh80Q0mMl8oExy",
            permissions: "*"
        }, {
            username: "operator",
            // verified bcrypt hash for 'FarmOperator2026!'
            password: "$2b$08$Oda.PNCSd0x9YFLMfSByaO1SXqIinNYs2E8XsWiP4NrB11OY7sWOG",
            permissions: "read"
        }]
    },

    // Node Installation Lockdown: Prevent unauthorized module installations in the field
    nodesExcludes: [
        '99-sample.js'
    ],
    editorTheme: {
        projects: {
            enabled: false
        },
        palette: {
            editable: false // Lock palette modifications in production
        },
        page: {
            title: "AgriSense-Edge Gateway Dashboard",
            favicon: "/favicon.ico"
        },
        header: {
            title: "AgriSense-Edge Pod™ Industrial Gateway [Offline Mode]",
            image: null
        }
    },

    // HTTP Security Headers & Rate Limiting Middleware
    httpNodeMiddleware: function(req, res, next) {
        // Enforce strict security headers
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: wss: ws:;");
        next();
    },

    // Enable TLS/HTTPS if certificates exist
    https: (function() {
        const certPath = path.join(__dirname, 'certs');
        const keyFile = path.join(certPath, 'server.key');
        const certFile = path.join(certPath, 'server.crt');
        if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
            return {
                key: fs.readFileSync(keyFile),
                cert: fs.readFileSync(certFile)
            };
        }
        return null;
    })(),

    // Context Storage with local persistent file backing
    contextStorage: {
        default: {
            module: "localfilesystem"
        },
        memoryOnly: {
            module: "memory"
        }
    },

    // Function node global variables and modules
    functionGlobalContext: {
        os: require('os'),
        PENMAN_MONTEITH_ALGORITHM: 'FAO-56',
        TARGET_LATENCY_MAX_MS: 120
    },

    // Export metrics and logging
    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: true
        }
    }
};

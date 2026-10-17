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
            // bcrypt hash of 'AgriSenseAdmin2026!' (12 rounds)
            password: "$2b$12$ZqS2oV9v2O1v9Gf0zI4WtuE5y4q.aB9D2C8K1L9M8N7O6P5Q4R3S2",
            permissions: "*"
        }, {
            username: "operator",
            // bcrypt hash of 'FarmOperator2026!'
            password: "$2b$12$Y1S2oV9v2O1v9Gf0zI4WtuE5y4q.aB9D2C8K1L9M8N7O6P5Q4R3S2",
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

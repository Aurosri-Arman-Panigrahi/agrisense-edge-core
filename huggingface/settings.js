/**
 * AgriSense-Edge Pod™ - Hugging Face Spaces Node-RED Settings
 * Optimized for Hugging Face Free CPU Basic Tier (Port 7860).
 */

module.exports = {
    // Flow configuration file
    flowFile: 'flows.json',
    flowFilePretty: true,

    // Bind to Hugging Face Spaces default port 7860
    uiPort: process.env.PORT || 7860,
    uiHost: '0.0.0.0',

    // Security Hardening: Admin Authentication using bcrypt
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            // verified bcrypt hash for 'admin@12345'
            password: "$2b$08$V7I8lYh0SkxzHZ41narljezV3mK./aRYaODgavKuDbcdc5yzwCX26",
            permissions: "*"
        }, {
            username: "operator",
            // verified bcrypt hash for 'FarmOperator2026!'
            password: "$2b$08$Oda.PNCSd0x9YFLMfSByaO1SXqIinNYs2E8XsWiP4NrB11OY7sWOG",
            permissions: "read"
        }]
    },

    editorTheme: {
        projects: {
            enabled: false
        },
        page: {
            title: "AgriSense-Edge SCADA Pipeline [Hugging Face Free Tier]"
        },
        header: {
            title: "AgriSense-Edge Pod™ Industrial Gateway | Hugging Face Cloud"
        }
    },

    // Allow embedding in Hugging Face Space iframe
    httpNodeCors: {
        origin: "*",
        methods: "GET,PUT,POST,DELETE"
    },

    httpNodeMiddleware: function(req, res, next) {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        // Allow Hugging Face to embed the canvas in their viewer
        res.removeHeader('X-Frame-Options');
        res.setHeader('Content-Security-Policy', "frame-ancestors * 'self'");
        next();
    },

    functionGlobalContext: {}
};

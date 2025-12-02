// Vercel serverless function wrapper
const path = require('path');

// Set the correct path for production build
process.chdir(path.join(__dirname, '..'));

// Import and export the Express app
module.exports = require('../dist/index.cjs');

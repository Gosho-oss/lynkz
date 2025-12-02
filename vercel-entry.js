// Vercel entry point for Express app
const path = require('path');
const fs = require('fs');

// Change to the correct directory
process.chdir(__dirname);

// Import the built Express app
const app = require('./dist/index.cjs');

// Export the app for Vercel
module.exports = app;
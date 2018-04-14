// Initializer
// -----------

// TODO: We need to clone the boot configuration because Require.js will change
// the reference directly

// Configure Require.js
requirejs.config(boot.configuration)

// Begin Warm-Up
require(['stratus'])

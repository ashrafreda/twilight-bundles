#!/usr/bin/env node

import { spawn } from 'child_process';

// Start Vite server
console.log('Starting Vite server...');
const viteProcess = spawn('vite', [], {
  stdio: ['inherit', 'pipe', 'inherit'],
  shell: true,
  env: { ...process.env }
});

// Function to extract port from Vite output
function extractPort(data) {
  const output = data.toString();
  console.log(output);
  
  // Look for the local server URL in Vite's output
  const match = output.match(/Local:\s+http:\/\/localhost:(\d+)/);
  if (match && match[1]) {
    const port = match[1];
    console.log(`Detected Vite server running on port: ${port}`);
    
    // Start the build process with the port as an environment variable
    console.log('Starting build process with watch mode...');
    const buildProcess = spawn('pnpm', ['run', 'build', '--watch'], {
      stdio: 'inherit',
      shell: true,
      env: { 
        ...process.env,
        TWILIGHT_BUNDLES_URL: `http://localhost:${port}`
      }
    });

    buildProcess.on('error', (err) => {
      console.error('Failed to start build process:', err);
      process.exit(1);
    });

    // Remove the data listener once we've started the build process
    viteProcess.stdout.removeListener('data', extractPort);
  }
}

// Listen for Vite server output
viteProcess.stdout.on('data', extractPort);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down...');
  viteProcess.kill();
  process.exit(0);
});

viteProcess.on('error', (err) => {
  console.error('Failed to start Vite server:', err);
  process.exit(1);
});

viteProcess.on('close', (code) => {
  console.log(`Vite server exited with code ${code}`);
  process.exit(code);
});

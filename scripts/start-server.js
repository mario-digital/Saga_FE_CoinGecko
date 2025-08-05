#!/usr/bin/env node

/**
 * Production server script with automatic port detection
 * Tries port 3000 first, then finds next available port if busy
 */

const { spawn } = require('child_process');
const net = require('net');

// Configuration
const DEFAULT_PORT = 3000;
const MAX_PORT = 3010; // Will try ports 3000-3010
const HOST = 'localhost';

/**
 * Check if a port is available
 * @param {number} port - Port number to check
 * @returns {Promise<boolean>} - True if port is available
 */
function isPortAvailable(port) {
  return new Promise(resolve => {
    const server = net.createServer();

    server.once('error', err => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, HOST);
  });
}

/**
 * Find an available port starting from the default
 * @returns {Promise<number>} - Available port number
 */
async function findAvailablePort() {
  for (let port = DEFAULT_PORT; port <= MAX_PORT; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    if (port === DEFAULT_PORT) {
      console.log(
        `⚠️  Port ${DEFAULT_PORT} is busy, checking for alternative ports...`
      );
    }
  }
  throw new Error(
    `No available ports found between ${DEFAULT_PORT} and ${MAX_PORT}`
  );
}

/**
 * Start the Next.js production server
 * @param {number} port - Port number to use
 */
function startProdServer(port) {
  const args = ['start', '--port', port.toString()];

  // Get any additional arguments passed to the script
  const additionalArgs = process.argv.slice(2);
  args.push(...additionalArgs);

  console.log(`\n🚀 Starting Next.js production server on port ${port}...`);
  console.log(`📡 Server will be available at: http://localhost:${port}\n`);

  const child = spawn('next', args, {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', error => {
    console.error('❌ Failed to start production server:', error);
    process.exit(1);
  });

  child.on('exit', code => {
    process.exit(code || 0);
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Find an available port
    const port = await findAvailablePort();

    if (port !== DEFAULT_PORT) {
      console.log(`✅ Using port ${port} (port ${DEFAULT_PORT} was busy)`);
    } else {
      console.log(`✅ Using default port ${DEFAULT_PORT}`);
    }

    // Start the server
    startProdServer(port);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Handle interruption signals gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down production server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down production server...');
  process.exit(0);
});

// Run the main function
main();

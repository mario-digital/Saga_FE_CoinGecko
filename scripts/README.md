# Scripts

This directory contains utility scripts for the project.

## Automatic Port Detection Scripts

### `dev-server.js`

Development server with automatic port detection. If port 3000 is busy, it automatically finds the next available port (3001-3010).

**Usage:**

```bash
npm run dev        # Start with automatic port detection
npm run dev:turbo  # Start with turbo mode and automatic port detection
npm run dev:fixed  # Force port 3000 (original behavior)
```

### `start-server.js`

Production server with automatic port detection. If port 3000 is busy, it automatically finds the next available port (3001-3010).

**Usage:**

```bash
npm run build      # Build the application first
npm start          # Start with automatic port detection
npm run start:fixed # Force port 3000 (original behavior)
```

## Features

- ✅ Automatically detects if port 3000 is in use
- ✅ Finds next available port (3001-3010)
- ✅ Clear console output showing which port is being used
- ✅ Graceful shutdown handling (SIGINT/SIGTERM)
- ✅ Works for both development and production servers

## Lighthouse Scripts

### `lighthouse-mobile.sh`

Runs Lighthouse performance audits with mobile device emulation.

**Usage:**

```bash
npm run lighthouse         # Run mobile audit
npm run lighthouse:mobile  # Run mobile audit (alias)
```

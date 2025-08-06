# Scripts

This directory contains utility scripts for the project.

## Automatic Port Detection Scripts

### `dev-server.js`

Development server with automatic port detection. If port 3000 is busy, it automatically finds the next available port (3001-3010).

**Usage:**

```bash
pnpm dev        # Start with automatic port detection
pnpm dev:turbo  # Start with turbo mode and automatic port detection
```

### `start-server.js`

Production server with automatic port detection. If port 3000 is busy, it automatically finds the next available port (3001-3010).

**Usage:**

```bash
pnpm build      # Build the application first
pnpm start      # Start with automatic port detection
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
pnpm lighthouse         # Run mobile audit
pnpm lighthouse:mobile  # Run mobile audit (alias)
```

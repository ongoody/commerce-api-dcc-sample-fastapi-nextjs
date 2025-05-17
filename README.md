# Goody Commerce API — Direct Card Capture Sample (FastAPI + Next.js)

Demonstrates adding a credit card with VGS Collect.js to Goody's Commerce API.

Requires Node.js (built on 22.x), [pnpm](https://pnpm.io/installation) (npm
works fine also), Python (built on 3.13.x), and [uv](https://github.com/astral-sh/uv).

## Backend

Runs at http://localhost:4000

```bash
# Install dependencies
uv sync

# Run server (automatically starts venv)
uv run python main.py
```

In `.env`, set `GOODY_COMMERCE_API_KEY` to your Goody Commerce sandbox API key.

## Frontend

TypeScript / Tailwind CSS / App Router

Runs at http://localhost:4001

```bash
# Install dependencies
pnpm install # or: npm install

# Run server
pnpm dev # or: npm run dev
```

## How it works

The frontend loads a credit card input form from VGS,

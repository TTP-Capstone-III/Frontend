# SpotB&B Web

React and Vite frontend for SpotB&B, a peer-to-peer parking marketplace.

## Requirements

- Node.js 20+
- npm
- A Mapbox public access token
- The SpotB&B API running locally

## Local setup

```bash
cp .env.example .env
npm install
npm run dev
```

The app starts at `http://localhost:5175`. Set `VITE_MAPBOX_PUBLIC_TOKEN` and `VITE_API_BASE_URL` in `.env`. The default API URL is `http://localhost:5050`.

## Checks

```bash
npm run lint
npm run test:run
npm run build
```

Only expose browser-safe values through `VITE_*` variables. Never place private API secrets in the frontend environment.

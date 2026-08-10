# Yuvansh MCP Server

Reusable MCP server for Yuvansh projects, starting with Chatty Pi.

## Features

- Streamable HTTP MCP endpoint at `/mcp`
- Health endpoint at `/health`
- Read-only Chatty Pi tools
- Pagination for list-style tools
- Development mock authentication
- Database/provider-independent Chatty Pi service layer
- Production fail-closed authentication until a trusted OAuth/JWT verifier is added
- No secrets committed to the repository

## Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
npm run build
npm start
```

Development mode:

```bash
npm run dev
```

With `ENABLE_MOCK_AUTH=true` and `NODE_ENV=development`, the server authenticates the configured `MOCK_USER_ID` and uses mock Chatty Pi data. This is for local testing only.

## Environment variables

- `PORT` — HTTP port, default `3000`
- `MCP_PATH` — MCP endpoint path, default `/mcp`
- `NODE_ENV` — `development` or `production`
- `CHATTY_PI_API_BASE_URL` — Chatty Pi API base URL
- `CHATTY_PI_API_KEY` — server-side Chatty Pi API credential
- `MCP_AUTH_TOKEN` — reserved for future trusted authentication integration
- `MOCK_USER_ID` — development-only mock user ID
- `ENABLE_MOCK_AUTH` — enables development mock mode

Never commit `.env` or real credentials.

## Endpoints

- `GET /health` — service health
- `POST /mcp` — Streamable HTTP MCP endpoint

## MCP tools

- `get_my_profile` — authenticated user's profile
- `get_my_posts` — authenticated user's posts, paginated
- `get_my_notifications` — authenticated user's notifications, paginated
- `get_my_yuvabucks` — authenticated user's YuvaBucks balance and transactions

All current tools are read-only. No account deletion, transfers, password changes, or other destructive operations are exposed.

## Security

Production requests currently fail closed until a trusted authentication layer is implemented. The server intentionally does not accept a user ID from an MCP client as proof of identity.

Before production deployment, connect the server to an OAuth 2.1/JWT verification layer and derive the Chatty Pi user identity from the verified credential. Do not replace this with a client-supplied header.

## Chatty Pi integration

The Chatty Pi API paths `/me`, `/posts`, `/notifications`, and `/yuvabucks` are placeholders for the eventual Chatty Pi API contract. Keep database-specific logic inside the service layer so the MCP interface does not depend on Zite, Firebase, Google Sheets, or another particular backend.

## Production domain

Intended endpoint:

`https://mcp.yuvansh.info/mcp`

DNS and hosting must be configured separately. Expose the service over HTTPS and configure credentials through the hosting provider's secret manager.

## Deployment

Deploy as a normal Node.js HTTP application on a Node-compatible host. Configure environment variables, expose HTTPS, and point `mcp.yuvansh.info` to the deployed service.

## Adding another project

Keep project-specific API calls inside a service module and register new MCP tools in their own module. Do not put database-specific logic directly inside the MCP transport layer.

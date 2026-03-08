# Realtime Deployment On AWS Lightsail

This is the primary phase 6 deployment path for the realtime Socket.IO server.

## Target Architecture

- `apps/web` stays on Vercel
- `Convex` stays hosted by Convex
- `apps/realtime` runs on one small Ubuntu Lightsail instance
- `Caddy` terminates TLS and reverse proxies to the realtime server container

This keeps the infrastructure small and the cost predictable while still giving the realtime server its own public `wss` endpoint.

## Why This Shape

- one small instance is enough for MVP traffic
- Caddy handles HTTPS automatically
- the existing `apps/realtime/Dockerfile` can be reused
- Vercel can connect to the realtime service over `wss://`

## In-Repo Files

- `apps/realtime/Dockerfile`
- `apps/realtime/deploy/lightsail/docker-compose.yml`
- `apps/realtime/deploy/lightsail/Caddyfile`
- `apps/realtime/deploy/lightsail/.env.example`

## Lightsail Setup

1. Create an Ubuntu instance in Lightsail.
2. Pick the smallest bundle that you are comfortable with for MVP traffic.
3. Attach a static IP.
4. Open firewall ports:
   - `22`
   - `80`
   - `443`
5. Point a DNS record such as `realtime.yourdomain.com` at the static IP.

## Server Bootstrap

SSH into the instance and install Docker plus the Docker Compose plugin.

Example high-level flow:

```bash
sudo apt update
sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Reconnect after adding your user to the Docker group.

## App Setup

1. Clone the repo onto the instance.
2. Copy the Lightsail env file:

```bash
cp apps/realtime/deploy/lightsail/.env.example apps/realtime/deploy/lightsail/.env
```

3. Fill in:
   - `NEXT_PUBLIC_CONVEX_URL`
   - `HOST_JWT_SECRET`
   - `CORS_ORIGIN`
   - `REALTIME_DOMAIN`

Example:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
HOST_JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=https://your-web-app.vercel.app
PORT=3001
REALTIME_DOMAIN=realtime.yourdomain.com
```

## Deploy

From the repo root on the Lightsail instance:

```bash
docker compose -f apps/realtime/deploy/lightsail/docker-compose.yml up -d --build
```

## Verify

Check container status:

```bash
docker compose -f apps/realtime/deploy/lightsail/docker-compose.yml ps
docker compose -f apps/realtime/deploy/lightsail/docker-compose.yml logs -f
```

Check health:

```bash
curl https://realtime.yourdomain.com/health
```

Expected response:

```json
{"ok":true}
```

## Vercel Wiring

Set this env var in Vercel:

```env
NEXT_PUBLIC_REALTIME_URL=https://realtime.yourdomain.com
```

Then redeploy the web app.

## Operational Notes

- the realtime service must be available over HTTPS in production so browser clients can use `wss://`
- `CORS_ORIGIN` should match the Vercel deployment origin
- `HOST_JWT_SECRET` must match the secret used by the web app

## Update Workflow

After pulling new code on the Lightsail instance:

```bash
git pull
docker compose -f apps/realtime/deploy/lightsail/docker-compose.yml up -d --build
```

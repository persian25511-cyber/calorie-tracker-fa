# Railway configuration

Railway **Config as Code** (`railway.json` / `railway.toml`) is deprecated and
cannot be opted into by new services. This project therefore uses
**Infrastructure as Code** at `.railway/railway.ts`.

## One-time setup

```bash
npm install          # installs the `railway` TypeScript SDK too
npm install -g @railway/cli
railway login
railway link         # link this directory to your Railway project/environment
# Hermes/npm environments that block install scripts need:
# npm install -g @railway/cli --allow-scripts=@railway/cli
```

## Plan and apply

```bash
railway config plan    # preview, safe
railway config apply   # preview + confirm
```

CI version (after storing a project token as `RAILWAY_TOKEN`):

```bash
railway config plan --out railway-plan.json
railway config apply --plan railway-plan.json --yes --confirm-destructive
```

The service runs `npm run build`, then `npm start`. The start script reads
the `PORT` injected by Railway (fallback 4173 locally), so a GitHub-triggered
deploy works even before IaC is applied.

See https://docs.railway.com/infrastructure-as-code

## If you deployed from GitHub without applying IaC

IaC is **not** applied automatically by a push. Set these two fields in
Railway service settings → Build & Deploy, then redeploy:

- Build Command: `npm run build`
- Start Command: `npm start`

Healthcheck path: `/`. No environment variables are required.

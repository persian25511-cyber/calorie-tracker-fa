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

The service runs `npm run build`, then serves `dist` with
`serve --single --listen $PORT dist`. `serve` is a devDependency and is
installed by Railpack before the build.

See https://docs.railway.com/infrastructure-as-code

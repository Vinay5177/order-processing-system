# Order Processing System — Microservices on OpenShift

A 3-tier microservices application demonstrating containerized deployment, 
service-to-service communication, and CI/CD on Red Hat OpenShift.

## Architecture
                ┌─────────────────┐
Internet ──────▶ │ api-gateway │ (Route, external)
└────────┬─────────┘
│
┌──────────────┴──────────────┐
▼ ▼
┌─────────────────┐ ┌──────────────────────┐
│ order-service │─────────▶│ inventory-service │
└─────────────────┘ └──────────────────────┘


- **api-gateway** — single external entry point, routes requests to internal services
- **order-service** — creates and tracks orders, reserves stock via inventory-service
- **inventory-service** — manages stock levels

All inter-service communication uses OpenShift's internal Service DNS 
(e.g. `http://inventory-service:8080`) — no hardcoded IPs.

## Tech Stack
- Node.js / Express (all 3 services)
- Red Hat OpenShift (Developer Sandbox)
- Source-to-Image (S2I) builds via `oc new-app`
- GitHub Actions for CI/CD

## Deployment

Each service is built directly from this repo using OpenShift's S2I nodejs builder:

\`\`\`bash
oc new-app nodejs~https://github.com/<you>/order-processing-system.git --context-dir=inventory-service --name=inventory-service
oc new-app nodejs~https://github.com/<you>/order-processing-system.git --context-dir=order-service --name=order-service
oc new-app nodejs~https://github.com/<you>/order-processing-system.git --context-dir=api-gateway --name=api-gateway
\`\`\`

Each service has:
- Readiness/liveness probes against `/health`
- Environment config sourced from a shared ConfigMap (`service-urls`)
- An OpenShift Route exposing `api-gateway` externally

## CI/CD

OpenShift's native git webhook trigger is blocked on Developer Sandbox 
(anonymous auth isn't permitted for inbound webhooks — `system:anonymous` 
gets a 403 on `buildconfigs/webhooks`). Worked around this with a 
GitHub Actions pipeline (`.github/workflows/deploy.yml`) instead: a 
dedicated `ci-bot` ServiceAccount authenticates via token and triggers 
`oc start-build` on every push to `main`.

## API Endpoints (via api-gateway)

| Method | Path                    | Description                  |
|--------|--------------------------|-------------------------------|
| POST   | /api/orders              | Place an order                |
| GET    | /api/orders              | List all orders               |
| GET    | /api/inventory/:sku      | Check stock for a SKU         |

## Runbook

**Redeploy after a code change:**
Push to `main` — GitHub Actions triggers builds automatically.

**Manual rebuild (if needed):**
\`\`\`bash
oc start-build <service-name> --follow
\`\`\`

**Check pod health:**
\`\`\`bash
oc get pods
oc logs deploy/<service-name>
\`\`\`

**Rollback a bad deployment:**
\`\`\`bash
oc rollout undo deploy/<service-name>
\`\`\`

## What this demonstrates
- Multi-service container builds via S2I
- Service discovery via Kubernetes/OpenShift DNS
- Health probes and self-healing pods
- ConfigMap-based externalized configuration
- CI/CD pipeline design, including working around a real platform constraint
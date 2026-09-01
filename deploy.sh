#!/usr/bin/env bash
# Deploy propulence-admin-app (React/Vite SPA) to production.
#
# Static files behind nginx — no PM2, no service restart. A deploy is just:
# build -> rsync dist/ to the server -> done. nginx serves whatever is on disk on the
# next request.
#
# Usage: ./deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SSH_KEY="$HOME/.ssh/propulence_prod.pem"
SSH_HOST="ubuntu@ec2-43-204-199-85.ap-south-1.compute.amazonaws.com"
REMOTE_DIST="/home/ubuntu/admin-app/dist"
LIVE_URL="https://superadmin.propulence.com"

cd "$SCRIPT_DIR"

echo "==> Building (tsc -b && vite build)…"
rm -rf dist
npm run build

echo "==> Syncing dist/ to $SSH_HOST:$REMOTE_DIST …"
rsync -avz --delete \
  -e "ssh -i $SSH_KEY" \
  dist/ "$SSH_HOST:$REMOTE_DIST/"

echo "==> Verifying…"
root_status=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL/")
echo "root: HTTP $root_status"

asset_path=$(curl -s "$LIVE_URL/" | grep -oE '/assets/index-[^"]+\.js' | head -1)
if [ -n "$asset_path" ]; then
  asset_status=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL$asset_path")
  echo "entry asset ($asset_path): HTTP $asset_status"
else
  echo "WARNING: could not find an entry asset reference in the live index.html"
fi

deep_link_status=$(curl -s -o /dev/null -w "%{http_code}" "$LIVE_URL/hero-banners")
echo "deep link (SPA fallback): HTTP $deep_link_status"

if [ "$root_status" = "200" ] && [ "${asset_status:-}" = "200" ] && [ "$deep_link_status" = "200" ]; then
  echo "==> Deploy verified OK."
else
  echo "==> One or more checks did not return 200 — investigate before considering this deploy done." >&2
  exit 1
fi

#!/usr/bin/env bash
# Restart the snowCourseHeatmap stack.
#
# Run by hand. Nothing runs this at boot: the Windows scheduled task only
# starts WSL, and the containers come back on their own because every service
# is "restart: unless-stopped". That also means a reboot never picks up a newer
# image -- Docker restarts the existing container from the existing image --
# which is why this script pulls the tunnel before recreating it.
set -euo pipefail

cd "$(dirname "$0")"

echo "Waiting for Docker..."
deadline=$((SECONDS + 600))
until docker info >/dev/null 2>&1; do
  if (( SECONDS > deadline )); then
    echo "Docker did not become ready within 10 minutes; giving up." >&2
    exit 1
  fi
  echo "Docker not ready, retrying in 5s..."
  sleep 5
done

# Refresh the tunnel image before restarting. Deliberately only the tunnel:
# a bare "docker compose pull" would fail on the locally built app image.
# A failure here is tolerated -- the network may not be up yet, and yesterday's
# tunnel beats no tunnel at all.
echo "Pulling cloudflared..."
docker compose pull cloudflare-tunnel || echo "cloudflared pull failed; continuing with the cached image"

docker compose down
docker compose up -d --remove-orphans

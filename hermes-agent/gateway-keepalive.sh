#!/usr/bin/env bash
# =============================================================================
# gateway-keepalive.sh — Bounded auto-restart supervisor for the Hermes gateway
#
# Strategy (per official Hermes docs):
#   * If `hermes gateway status` shows a gateway already running, exit 0.
#   * Else, on hosts with systemd/launchd, ensure the background service is
#     installed (`hermes gateway install --start-now`) so it persists 24/7 and
#     survives reboots.
#   * Otherwise (WSL2 / Docker / Termux / bare runner), launch the gateway in
#     the foreground (`hermes gateway run --replace`) inside a bounded loop that
#     restarts it on crash — this is what the docs recommend for container/wsl.
#
# The workflow calls this on every scheduled run, so this is the 24/7
# self-healing mechanism: if the gateway ever exits, the next cron run revives it.
# =============================================================================
set -u

find_hermes() {
  for cand in \
    "${HERMES_BIN:-}" \
    "${HERMES_HOME:-$HOME/.hermes}/hermes-agent/venv/bin/hermes" \
    "$HOME/.local/bin/hermes" \
    "/usr/local/bin/hermes"; do
    if [ -n "$cand" ] && [ -x "$cand" ]; then
      echo "$cand"
      return
    fi
  done
  if command -v hermes >/dev/null 2>&1; then
    command -v hermes
    return
  fi
  echo "hermes"
}

HERMES="$(find_hermes)"
MAX_RESTARTS="${GATEWAY_MAX_RESTARTS:-10}"
RESTART_SLEEP="${GATEWAY_RESTART_SLEEP:-5}"
GATEWAY_MODE="${GATEWAY_MODE:-auto}"

log() { echo "[gateway-keepalive] $*"; }

is_gateway_running() {
  local status_out
  status_out="$("$HERMES" gateway status 2>&1 || true)"
  if printf '%s' "$status_out" | grep -qiE "Gateway is running|active \(running\)"; then
    return 0
  fi
  if printf '%s' "$status_out" | grep -qiE "not running|is stopped|inactive"; then
    return 1
  fi
  if pgrep -f "hermes.*gateway.*run" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

# 1. Check if gateway is already active
if is_gateway_running; then
  log "Gateway is already running and healthy — nothing to do."
  exit 0
fi

log "Gateway is currently not running."

# 2. On hosts with systemd/launchd, install or start the managed service
if [ "$GATEWAY_MODE" = "service" ] || { [ "$GATEWAY_MODE" = "auto" ] && { [ -d /run/systemd/system ] || command -v launchctl >/dev/null 2>&1; }; }; then
  log "System service manager (systemd/launchd) detected."
  log "Attempting to install and start gateway service..."
  
  if "$HERMES" gateway install --start-now >/dev/null 2>&1 || "$HERMES" gateway start >/dev/null 2>&1; then
    sleep 2
    if is_gateway_running; then
      log "Gateway service successfully installed and active."
      exit 0
    fi
  fi
  log "System service start did not take effect; falling back to supervisor mode."
fi

# 3. Handle Daemon mode (starts background process and verifies it stays alive)
if [ "$GATEWAY_MODE" = "daemon" ]; then
  log "Starting gateway in background daemon mode..."
  mkdir -p "$HOME/.hermes/data/logs"
  (setsid nohup "$HERMES" gateway run --replace </dev/null >> "$HOME/.hermes/data/logs/gateway.log" 2>&1 &)
  sleep 3
  if is_gateway_running; then
    log "Gateway started successfully in background daemon mode."
    exit 0
  else
    log "Gateway daemon failed to stay up. Checking logs:"
    tail -n 20 "$HOME/.hermes/data/logs/gateway.log" 2>/dev/null || true
    exit 1
  fi
fi

# 4. Foreground supervisor loop with bounded restarts (default fallback for containers/WSL)
log "Running gateway in supervised foreground mode..."
restarts=0
while true; do
  log "Starting gateway (`hermes gateway run --replace`)... attempt $((restarts + 1))"
  "$HERMES" gateway run --replace
  rc=$?

  if [ "$rc" -eq 0 ]; then
    log "Gateway exited cleanly."
    exit 0
  fi

  restarts=$((restarts + 1))
  if [ "$restarts" -ge "$MAX_RESTARTS" ]; then
    log "Gateway exited with error $restarts consecutive times — exiting with code $rc."
    exit 1
  fi

  log "Gateway exited with code $rc. Restarting in ${RESTART_SLEEP}s (attempt $restarts/$MAX_RESTARTS)..."
  sleep "$RESTART_SLEEP"
done
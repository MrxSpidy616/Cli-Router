#!/usr/bin/env bash
# =============================================================================
# install-hermes.sh — Idempotent Hermes Agent install + non-interactive config
#
# Used by the 24/7 GitHub Actions workflow AFTER secrets have been written to
# the process environment (they come from GitHub secrets, never from this repo).
#
# What it does:
#   1. Installs Hermes Agent if not already installed (official installer).
#   2. Ensures ~/.hermes/.env exists with Google Gemini + Telegram credentials.
#   3. Sets the default model/provider in ~/.hermes/config.yaml (non-interactive).
#   4. Runs `hermes doctor` as a sanity check.
#   5. Does NOT manage the gateway — that is gateway-keepalive.sh's job.
# =============================================================================
set -e

# Interpolate secrets found in the process env (set by the workflow).
# No secrets are ever hardcoded here.
GEMINI_API_KEY="${GEMINI_API_KEY:-${GOOGLE_API_KEY:-}}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_HOME_CHANNEL="${TELEGRAM_HOME_CHANNEL:-}"
# Telegram allowlist (space- or comma-separated). If unset, defaults to '*' for open access.
TELEGRAM_ALLOWED_USERS="${TELEGRAM_ALLOWED_USERS:-}"
# Allow the agent to be triggered by @mention in non-allowlisted groups.
TELEGRAM_GUEST_MODE="${TELEGRAM_GUEST_MODE:-false}"

HERMES_PROVIDER="${HERMES_PROVIDER:-gemini}"
HERMES_DEFAULT_MODEL="${HERMES_DEFAULT_MODEL:-gemini-3.6-flash}"

export HERMES_ACCEPT_HOOKS=1

log() { echo "[install-hermes] $*"; }

# ----------------------------------------------------------------------------
# 1. Locate (or create) hermes
# ----------------------------------------------------------------------------
find_hermes() {
  # Prefer the venv launcher created by the native installer.
  for cand in \
    "${HERMES_HOME:-$HOME/.hermes}/hermes-agent/venv/bin/hermes" \
    "$HOME/.local/bin/hermes" \
    "/usr/local/bin/hermes"; do
    if [ -x "$cand" ]; then
      echo "$cand"
      return
    fi
  done
  # Fall back to a bare `hermes` that the installer put on PATH.
  if command -v hermes >/dev/null 2>&1; then
    command -v hermes
    return
  fi
  return 1
}

HERMES_BIN="$(find_hermes || true)"

if [ -n "$HERMES_BIN" ]; then
  log "Existing install found: $HERMES_BIN"
else
  log "Installing Hermes Agent (first time), this may take several minutes..."
  log "Skipping browser automation (headless runner)"
  curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash -s -- --skip-browser
  HERMES_BIN="$(find_hermes || true)"
  if [ -z "$HERMES_BIN" ]; then
    echo "[install-hermes] FATAL: install completed but hermes was not found." >&2
    exit 1
  fi
fi

# Ensure bin directory is added to PATH for subsequent steps if in GitHub Actions
HERMES_DIR="$(dirname "$HERMES_BIN")"
if [ -n "${GITHUB_PATH:-}" ]; then
  echo "$HERMES_DIR" >> "$GITHUB_PATH"
  echo "$HOME/.local/bin" >> "$GITHUB_PATH"
fi
export PATH="$HERMES_DIR:$HOME/.local/bin:$PATH"

# ---------------------------------------------------------------------------
# 2. Write ~/.hermes/.env with credentials (file mode 0600, never committed)
# ---------------------------------------------------------------------------
update_env() {
  local key="$1" val="$2"
  [ -z "$val" ] && return
  local f="$HOME/.hermes/.env"
  if [ -f "$f" ] && grep -qE "^${key}=|^${key} +" "$f"; then
    # replace the existing value (preserve rest of file)
    sed -i -E "s/^${key}=.*/${key}=${val}/" "$f"
  else
    printf '\n%s=%s\n' "$key" "$val" >> "$f"
  fi
}

mkdir -p "$HOME/.hermes"
touch "$HOME/.hermes/.env"
chmod 600 "$HOME/.hermes/.env"

update_env "GEMINI_API_KEY" "$GEMINI_API_KEY"
update_env "GOOGLE_API_KEY" "$GEMINI_API_KEY"
update_env "TELEGRAM_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN"
[ -n "$TELEGRAM_HOME_CHANNEL" ]  && update_env "TELEGRAM_HOME_CHANNEL" "$TELEGRAM_HOME_CHANNEL"
[ -n "$TELEGRAM_ALLOWED_USERS" ] && update_env "TELEGRAM_ALLOWED_USERS" "$TELEGRAM_ALLOWED_USERS"

if [ "$TELEGRAM_GUEST_MODE" = "true" ] || [ "$TELEGRAM_GUEST_MODE" = "1" ]; then
  update_env "TELEGRAM_GUEST_MODE" "true"
fi

# If no allowlist was provided and no token was previously set with one, allow all
if [ -z "$TELEGRAM_ALLOWED_USERS" ]; then
  update_env "TELEGRAM_ALLOWED_USERS" "*"
fi
log "Written credentials + Telegram access to $HOME/.hermes/.env (redacted from logs)."

# ---------------------------------------------------------------------------
# 3. Set provider + default model in config.yaml (idempotent)
# ---------------------------------------------------------------------------
if [ ! -f "$HOME/.hermes/config.yaml" ]; then
  log "No config.yaml yet — allowing Hermes to generate defaults first."
fi

"$HERMES_BIN" config set model.provider "$HERMES_PROVIDER" || true
if [ "$HERMES_PROVIDER" = "gemini" ]; then
  "$HERMES_BIN" config set model.base_url "https://generativelanguage.googleapis.com/v1beta" || true
fi
"$HERMES_BIN" config set model.default "$HERMES_DEFAULT_MODEL" || true
log "Configured model.provider=$HERMES_PROVIDER, model.default=$HERMES_DEFAULT_MODEL"

# ---------------------------------------------------------------------------
# 4. Sanity check
# ---------------------------------------------------------------------------
log "Running sanity check: $HERMES_BIN doctor"
"$HERMES_BIN" doctor >/dev/null 2>&1 && log "Doctor check OK" || log "Doctor reported non-fatal warnings"

log "install-hermes.sh finished successfully."
exit 0
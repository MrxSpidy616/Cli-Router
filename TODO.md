# Project Roadmap

Prioritized follow-up work across the router, scrapers, Telegram bots, and Cloudflare Workers. Items are proposals; check platform terms and applicable law before enabling integrations or collection jobs.

## P0 — Security and reliability

- [ ] **Remove and rotate exposed credentials.** Replace any Telegram bot token/API credential embedded in source or config with environment variables or deployment secrets; revoke the previously exposed tokens and scan repository history for secrets.
- [ ] **Add a shared secrets policy.** Expand `.gitignore`, provide `.env.example` templates without real values, and add secret scanning to CI.
- [ ] **Secure public endpoints.** Require authorization and rate limits for clone, collector, proxy, and file-management APIs; avoid leaving status or destructive routes unauthenticated.
- [ ] **Prevent SSRF in URL-fetching routes.** Validate allowed schemes/hosts, reject private and link-local IPs after DNS resolution, and re-check redirects in the B2/Beeg/proxy handlers.
- [ ] **Bound resource usage.** Set upload/download and request-body limits, task timeouts, concurrency caps, temporary-file quotas, and cleanup-on-cancel.
- [ ] **Make job state durable.** Replace in-memory task maps with SQLite or a managed queue so jobs survive restarts and status lookups are isolated per user.
- [ ] **Add tests and CI checks.** Run Python compile/lint/tests, JavaScript checks, JSON/TOML validation, and dependency vulnerability checks on pull requests.

## P1 — LinksHub and metadata scrapers

- [ ] **Finish ePorner metadata recovery.** Resume the cache-backed run, report confirmed API results separately from longest-related search matches, and preserve source URL/title provenance.
- [ ] **Unify scraper infrastructure.** Share URL parsing, retry/backoff, request timeouts, caching, checkpoints, CSV/JSON export, and structured logging across ePorner, Pornhub, and MissAV.
- [ ] **Make scraper runs restartable and atomic.** Save incremental state safely, avoid rewriting large exports for every small checkpoint, and provide `--resume`, `--limit`, and `--dry-run` consistently.
- [ ] **Add result validation.** Check CSV row counts against input, verify required columns and URLs, distinguish removed/unsupported/rate-limited/network-error outcomes, and emit a run summary.
- [ ] **Add API quota controls.** Configure conservative rate limits per upstream, honor `Retry-After`, and expose concurrency settings instead of maximizing parallel calls by default.
- [ ] **Add source provenance and match confidence.** Record API vs page-extracted vs inferred fields, original IDs, replacement IDs, match keywords, and confidence score.
- [ ] **Add periodic refresh mode.** Re-check stale metadata on a configurable schedule while preserving historical status and last-checked time.
- [ ] **Add scraper tests with fixtures.** Cover URL edge cases, title extraction, unavailable IDs, API response variations, CSV escaping, checkpoints, and retry behavior.
- [ ] **Normalize LinksHub input files.** Deduplicate and canonicalize domains/URLs; identify media downloads, direct video pages, profiles, and collection pages separately.

## P1 — Cloudflare Workers / DriveBucket

- [ ] **Harden B2 request handling.** Validate object keys and paths, constrain listing prefixes, safely encode names, and prevent unauthorized cross-origin mutations.
- [ ] **Add authentication and CSRF protection.** Protect rename/move/delete routes, validate origins for browser mutations, and make destructive actions auditable.
- [ ] **Improve API responses.** Return consistent JSON errors, correct HTTP statuses, and request IDs; do not expose B2 credentials or internal provider errors.
- [ ] **Add Worker tests and preview config.** Test routing, auth, B2 errors, path encoding, and missing bindings without production credentials.
- [ ] **Add operational health checks.** Provide a health endpoint and document required bindings/secrets and safe deployment/rollback steps.

## P1 — Telegram bots and MEGA tools

- [ ] **Consolidate duplicated Mega-Clonr implementations.** Remove or clearly mark duplicate folders/scripts and share the core clone/upload logic.
- [ ] **Add per-user authorization and quotas.** Restrict expensive operations, enforce ownership checks for cancellation/status, and protect API endpoints with scoped tokens.
- [ ] **Harden file processing.** Sanitize filenames, avoid shell interpolation, validate archive paths against traversal, cap archive size/entry counts, and clean temporary files after failures.
- [ ] **Improve upload resilience.** Add resumable uploads, idempotency keys, retry classification, bounded retry counts, and persistent job progress.
- [ ] **Add Telegram rate-limit handling.** Respect Telegram retry hints, serialize per-chat operations, and handle message-size/caption limits explicitly.
- [ ] **Improve collector storage.** Use SQLite with deduplication, timestamps, source/user attribution, backups, and export pagination instead of unbounded JSON files.

## P2 — Developer experience and maintenance

- [ ] **Reconcile documentation with the repository.** Update README commands, folder names, deployment notes, actual endpoints, environment variables, and generated-data locations.
- [ ] **Add dependency manifests and lockfiles.** Pin compatible ranges for each service and document supported Python/Node versions.
- [ ] **Add structured logs and metrics.** Track request outcomes, retries, queue depth, scrape coverage, and API latency without logging tokens or sensitive URLs.
- [ ] **Add a configuration validator.** Check required settings, mutually exclusive modes, path existence, and safe defaults before starting services.
- [ ] **Add graceful shutdown.** Stop accepting work, cancel or checkpoint active jobs, close HTTP clients, and clean temporary resources.
- [ ] **Separate generated data from source.** Decide which CSV/JSON/cache files belong in Git; ignore caches and large generated outputs unless intentionally versioned.
- [ ] **Add a release/deployment workflow.** Build reproducible artifacts, run validations, deploy staging first, and document rollback.

## P2 — Product features

- [ ] **Unified metadata search.** Search indexed metadata by title, performer, tag, duration, rating, and source, with filters and pagination.
- [ ] **Duplicate detection.** Identify duplicate URLs/video IDs across sources and near-duplicate metadata using normalized titles and fingerprints.
- [ ] **Job dashboard.** Provide authenticated job history, progress, retry controls, export links, and per-user quotas.
- [ ] **Scheduled metadata refresh.** Run incremental refreshes and report newly available, removed, or changed records.
- [ ] **Portable deployment profiles.** Offer documented local Docker Compose and Cloudflare deployment configurations with safe defaults.

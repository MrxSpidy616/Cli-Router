# Cli-Router

A collection of CLI tools, scrapers, Telegram bots, and cloud utilities for media automation and file management.

---

## Projects

### beeg-scarper

Flask web app + CLI tool for browsing and streaming beeg.com content. Provides search, homepage browsing, stream URL extraction (H264/H265/AV1), thumbnails, and video previews.

**Run:**
```bash
cd beeg-scarper/beeg-scarper
pip install flask requests
python app.py          # Web UI on port 5000
python beeg.py         # CLI mode
```

**API:** `/api/home?offset=0`, `/api/search?q=query&offset=0`, `/proxy?url=...`

---

### eporner-scraper

Telethon-based async downloader + uploader. Reads batch URLs, downloads via yt-dlp with aria2c, uploads to a Telegram channel, and tracks completed downloads in an archive file.

**Run:**
```bash
cd eporner-scraper/eporner-scraper
pip install telethon rich yt-dlp
# Add links to adbatch.txt, then:
python advanced.py
```

**Features:** Disk space checks, progress bars, auto-cleanup after upload, dedup via archive.

---

### Mega-Clonr

Telegram bot that clones `mega.nz` links — sends previews, direct file URLs, and builds ZIP/CBZ/PDF archives. Includes a lightweight Cloudflare Worker variant.

**Run (Python bot):**
```bash
cd Mega-Clonr
pip install -r requirements.txt
cp .env.example .env   # fill BOT_TOKEN, API_ID, API_HASH
python bot.py
```

**Run (CF Worker):** see `cf-worker` branch.

**Commands:** `/start`, `/settings`, `/cancel`, `/multi`

---

### DriveBucket (B2 File Manager)

Cloudflare Worker that provides a web-based file manager for a Backblaze B2 bucket. Browse, search, rename, move, delete, view, and download files through a dark-mode UI.

**Deploy:**
```bash
npm install -g wrangler
wrangler secret put B2_APPLICATION_KEY_ID
wrangler secret put B2_APPLICATION_KEY
# Edit wrangler.toml with your bucket ID/name
wrangler deploy
```

**API:** `GET /`, `GET /file/:name`, `POST /api/rename`, `POST /api/move`, `DELETE /api/delete`

---

### collector.py

Telegram bot that collects download links from forwarded messages. Normalizes Unicode text, extracts download URLs from message entities, and stores them locally.

**Run:**
```bash
pip install requests
python collector.py
```

**Commands (in Telegram):** `/send` (dump links), `/count`, `/clear`

---

## Repository Structure

```
├── beeg-scarper/beeg-scarper/   # Video scraper (Flask + CLI)
├── eporner-scraper/eporner-scraper/ # YT-DLP downloader + TG uploader
├── Mega-Clonr/                  # MEGA.nz Telegram cloner bot
├── Pichoose/                    # (placeholder)
├── index.js                     # CF Worker B2 file manager
├── collector.py                 # Telegram link collector bot
├── wrangler.toml                # CF Worker config
├── .env                         # Environment variables
└── collected_data.json          # Collected link data
```

## License

MIT

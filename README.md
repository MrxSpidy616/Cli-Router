# DriveBucket — B2 File Manager for Cloudflare Workers

A file manager for Backblaze B2 buckets, hosted entirely on Cloudflare Workers. View, download, rename, move, and delete files and folders — no upload.

## Features

- **Browse** — Virtual folder navigation using B2 prefix listing with breadcrumbs
- **View** — Inline preview of images, text, PDFs, audio/video (no download needed)
- **Download** — Stream files directly from B2 with correct content types
- **Rename** — Rename files and folders (server-side copy + delete)
- **Move** — Move files and folders between locations in the bucket
- **Delete** — Delete individual files or entire folders (recursive)
- **Search** — Find files by name across the whole bucket
- **Dark/Light Mode** — Theme preference saved to localStorage
- **CORS** — Enabled on all endpoints

## Setup

### Prerequisites

- Backblaze B2 account with a bucket created
- Application key with **Read and Write** access to the bucket
- Cloudflare account with Workers enabled

### Configuration

1. **Edit `wrangler.toml`** and fill in your credentials:

```toml
[vars]
B2_APPLICATION_KEY_ID = "your-key-id"
B2_APPLICATION_KEY = "your-application-key"
B2_BUCKET_ID = "your-bucket-id"
B2_BUCKET_NAME = "your-bucket-name"
```

> **Security note**: NEVER commit the application keys. Store them as Workers Secrets:
> ```bash
> wrangler secret put B2_APPLICATION_KEY_ID
> wrangler secret put B2_APPLICATION_KEY
> ```

2. **Deploy:**

```bash
wrangler deploy
```

## Deploying with GitHub Actions

The repo includes `.github/workflows/deploy.yml` which deploys automatically on pushes to `main`/`master`.

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with `Workers Scripts: Edit` permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `B2_APPLICATION_KEY_ID` | B2 key ID |
| `B2_APPLICATION_KEY` | B2 application key |

Add them in **Repo → Settings → Secrets and variables → Actions**. The workflow puts the B2 keys as encrypted Workers Secrets before each deploy. You can also trigger a manual deploy via the **Actions → Deploy Worker → Run workflow** button.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard UI (supports `?path=` and `?search=` params) |
| GET | `/file/:filename` | View or download a file (`?dl=1` forces download) |
| POST | `/api/rename` | Rename a file or folder (JSON: `{oldPath, newName, isFolder}`) |
| POST | `/api/move` | Move a file or folder (JSON: `{oldPath, destFolder, isFolder}`) |
| DELETE | `/api/delete?path=...` | Delete a file or folder (folders delete recursively) |

## Usage

### Dashboard

Navigate to your worker URL to open the file manager:

```
https://your-worker.workers.dev/
```

- Click a **folder** to navigate into it (breadcrumbs show your path)
- Click a **file name** to view it inline (images, text, PDFs open in browser)
- Use **⬇️** to download, **✏️** to rename, **📂** to move, **🗑️** to delete
- Use **search** to filter files by name across the whole bucket
- Folder actions apply to every file inside the folder

### API Examples

**Rename a file:**
```bash
curl -X POST https://your-worker.workers.dev/api/rename \
  -H "Content-Type: application/json" \
  -d '{"oldPath": "docs/old-name.txt", "newName": "new-name.txt", "isFolder": false}'
```

**Move a folder:**
```bash
curl -X POST https://your-worker.workers.dev/api/move \
  -H "Content-Type: application/json" \
  -d '{"oldPath": "projects/", "destFolder": "archive", "isFolder": true}'
```

**Delete a folder (recursive):**
```bash
curl -X DELETE "https://your-worker.workers.dev/api/delete?path=tmp/"
```

**Download a file:**
```bash
curl -o photo.jpg "https://your-worker.workers.dev/file/images/photo.jpg"
```

## How It Works

1. **Auth**: The worker authenticates with B2's API using application key credentials and caches the auth token in a KV namespace.
2. **Listing**: Uses B2's `b2_list_file_names` with prefix filtering to show virtual folders.
3. **Download**: Streams files directly from B2's download endpoint (inline for viewable types, attachment otherwise).
4. **Rename/Move**: Uses B2's `b2_copy_file` (server-side copy, no bandwidth cost) then deletes the original file version. Folders are handled recursively.
5. **Delete**: Removes file versions via `b2_delete_file_version`.

## Limitations

- Requires an application key with **Read and Write** access (rename/move/delete won't work with read-only keys)
- Renaming/moving large folders issues one API call per file and may take time
- B2 copy keeps the same storage class; versions are copied as new versions

## License

MIT
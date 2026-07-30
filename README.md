# HackNotify — Open-Source Hackathon Tracker

> **Contributions welcome!** → [github.com/tecrade/HackNotify](https://github.com/tecrade/HackNotify)

A fully free, open-source pipeline that automatically discovers hackathon listings from any URL you add, classifies them by **region** (Kerala / India / Global) and **mode** (Online / Offline / Hybrid), and displays them on a beautiful light-themed React portal — hosted for $0 with automated 48-hour updates via GitHub Actions.

---

## ✨ How It Works

Most scrapers break when a website redesigns its HTML. **HackNotify doesn't** — because it reads pages _semantically_ using AI:

1. **Fetch** — `scraper/fetch_page.py` fetches the page. Automatically detects whether it's an HTML page or a direct API JSON endpoint and processes each appropriately (no `markdownify` / recursion issues for API URLs).
2. **Clean** — HTML pages are stripped of boilerplate, navigation, ads etc. and converted to clean Markdown. API JSON responses are structured into readable item lists.
3. **Extract** — The clean text is sent to **Google Gemini 2.5 Flash** (free tier) with a fixed JSON schema. The AI extracts every hackathon field without brittle CSS selectors.
4. **Store** — The structured data is saved to `data/hackathons.json` **and** automatically synced to `frontend/public/data/hackathons.json`.
5. **Display** — A Vite + React + Tailwind frontend reads the JSON and renders filterable hackathon cards.

---

## 🏗️ Architecture

```
scraper/sources.py  ← Add/edit URLs here (HTML pages OR API endpoints)
        │
        ▼
scraper/fetch_page.py
  ├── ApiJsonProcessor   → direct API JSON response → structured Markdown
  ├── EmbeddedStateExtractor → __NEXT_DATA__ / JSON-LD extraction
  └── DomCleaner         → HTML → clean Markdown (with recursion protection)
        │
        ▼
scraper/ai_extract.py
  ├── Gemini 2.5 Flash (primary)
  ├── Fallback: gemini-2.0-flash → gemini-1.5-flash
  ├── 503/429 retry with exponential backoff + jitter
  └── Per-chunk error isolation (one failed chunk ≠ abort URL)
        │
        ▼
scraper/scrape.py  (orchestrator, de-duplication, normalization)
        │
        ├──► data/hackathons.json
        └──► frontend/public/data/hackathons.json
                        │
                        ▼
              React + Vite + Tailwind frontend
```

---

## 🚀 Quick Start

### 1. Add Sources

Edit [`scraper/sources.py`](scraper/sources.py) and append any hackathon listing or API URL to `SOURCE_URLS`. That's it — no custom parsers needed:

```python
SOURCE_URLS = [
    "https://devfolio.co/hackathons",                          # HTML listing
    "https://devpost.com/api/hackathons?status[]=open&per_page=50",   # API JSON
    "https://unstop.com/api/public/opportunity/search-result?...",    # API JSON
    "https://your-new-site.com/hackathons",                    # Just add it!
]
```

### 2. Get a Free Gemini API Key

Go to <https://aistudio.google.com/apikey> and generate a free key (no credit card required).

### 3. Run the Scraper Locally

```bash
cd scraper
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Paste your GEMINI_API_KEY into .env
python scrape.py
```

This writes `data/hackathons.json` and automatically syncs it to `frontend/public/data/hackathons.json`.

### 4. Run the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL — filter hackathons by region, mode, and type, or search by title / theme / organizer.

---

## 🌐 Deploy for Free

### Option A — Netlify (Recommended, 1-click)

A [`netlify.toml`](netlify.toml) is included at the repo root:

```toml
[build]
  base    = "frontend"
  publish = "dist"
  command = "npm run build"
```

1. Push the repo to GitHub.
2. Go to [Netlify](https://app.netlify.com/) → **Add new site** → **Import an existing project**.
3. Select your repo — Netlify auto-detects `netlify.toml` and configures everything.
4. Click **Deploy site**. Done!

### Option B — GitHub Pages

`.github/workflows/deploy.yml` builds the React app and publishes it to GitHub Pages whenever `frontend/` or the data file changes.

Enable once: **Settings → Pages → Source → GitHub Actions**.

---

## ⏰ Automated 48-Hour Data Updates (GitHub Actions)

`.github/workflows/scrape.yml` runs the full scraping pipeline automatically **every 48 hours** (every 2 days):

```yaml
on:
  schedule:
    - cron: "0 3 */2 * *"   # Every 48h at 03:00 UTC (~08:30 IST)
  workflow_dispatch: {}      # Trigger manually from the Actions tab
```

**Setup (one time):**

1. Go to your GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**.
2. Name: `GEMINI_API_KEY` | Value: *your Gemini API key*
3. Save.

After every scrape run, the workflow automatically commits updated `data/hackathons.json` files and pushes — triggering a new Netlify/Pages deploy automatically.

---

## 🛡️ Resilience Features

| Feature | Details |
|---|---|
| **API JSON detection** | Auto-detects JSON content-type or JSON body, bypasses HTML parsing entirely |
| **503 High Demand retry** | Exponential backoff with jitter (4s, 10s, 20s, 40s...) |
| **Model fallback chain** | `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` |
| **Chunk isolation** | Failed chunks don't abort the whole URL — rest of chunks still processed |
| **Recursion protection** | DomCleaner catches markdownify stack overflows, falls back to plain text |
| **De-duplication** | Hackathons de-duplicated by `title + date` key across all sources |

---

## 📦 Data Schema

Every hackathon object in `data/hackathons.json`:

```json
{
  "title": "string",
  "date": "string",
  "venue": "string",
  "mode": "online | offline | hybrid",
  "region": "kerala | india | global",
  "registration_url": "string",
  "prize_pool": "string",
  "prize_details": "string",
  "max_participants": "string",
  "theme": "string",
  "hackathon_type": "software | hardware | hybrid",
  "organizer": "string",
  "source_url": "string"
}
```

---

## 📁 Project Layout

```
scraper/
  sources.py        ← Add/remove source URLs here
  fetch_page.py      HTML + API JSON fetching and preprocessing
  ai_extract.py      Gemini AI extraction, retries, and model fallbacks
  scrape.py          Orchestrator — normalize, dedupe, write JSON
  requirements.txt
  .env.example

data/
  hackathons.json    Latest scraped dataset (checked into repo)

frontend/
  src/
    App.jsx           Root app, filtering logic
    components/
      Header.jsx        Hero banner + live tracker pill + GitHub link
      FilterBar.jsx     Sticky region/mode/type filter + search
      HackathonCard.jsx Card component with badges, specs, CTA
      EmptyState.jsx    Empty filter results state
    data/
      taxonomy.js       Region/mode/type label + badge configuration
  public/data/          hackathons.json served to browser
  tailwind.config.js
  vite.config.js

.github/workflows/
  scrape.yml            Cron every 48h: scrape → commit → push
  deploy.yml            On push: build frontend → deploy to GitHub Pages

netlify.toml            Zero-config Netlify deployment
```

---

## 🔄 Swapping the AI Provider

`ai_extract.py` is intentionally small and self-contained. To swap to another LLM (e.g. Groq's Llama, OpenAI GPT-4o-mini):

1. Replace `_get_client()` and `_extract_chunk_with_model()` with your provider's SDK.
2. Keep the `SCHEMA_INSTRUCTIONS` prompt and output JSON schema unchanged.

---

## 🤝 Contributing

Contributions are welcome and encouraged!

- **Add a new source**: Edit [`scraper/sources.py`](scraper/sources.py) and add a URL.
- **Improve AI extraction**: Tweak `SCHEMA_INSTRUCTIONS` in `ai_extract.py`.
- **Fix the frontend**: All UI lives in `frontend/src/`.
- **File a bug or feature request**: [Open an issue](https://github.com/tecrade/HackNotify/issues).
- **Submit a pull request**: Fork → branch → PR against `main`.

---

## 📄 License

Open source — use, fork, and extend freely.

Made with ❤️ by [Tecrade](https://tecrade.github.io/)

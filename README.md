# HackScan — Open-Source Hackathon Radar

A fully free, open-source pipeline that scrapes hackathon listings from any
URL you add, classifies them by **region** (Kerala / India / Global) and
**mode** (Online / Offline / Hybrid), and displays them on a responsive
React portal — all hosted for $0 on GitHub.

## Why this doesn't break when a site redesigns

Most scrapers use CSS selectors (`div.card > h2.title`) that break the
moment a site changes its markup. This project instead:

1. Fetches the page and strips it down to clean, readable text
   (`scraper/fetch_page.py`, using `trafilatura`).
2. Hands that text to a free LLM (Google **Gemini 2.0 Flash**, free tier)
   with a fixed JSON schema and asks it to extract the hackathon fields
   (`scraper/ai_extract.py`).

Because the AI reads the page semantically rather than by HTML structure,
it keeps working across redesigns — you only maintain a list of URLs, never
per-site parsers.

## Architecture

```
sources.py (URLs you maintain)
        │
        ▼
fetch_page.py  ──►  clean text  ──►  ai_extract.py (Gemini free tier)
        │                                    │
        └──────────────► scrape.py ◄─────────┘
                              │
                              ▼
                   data/hackathons.json
                              │
                              ▼
              frontend/public/data/hackathons.json
                              │
                              ▼
                 React + Tailwind portal (Vite)
```

## 1. Add / edit sources

Edit `scraper/sources.py` and add any hackathon listing or detail page URL
to `SOURCE_URLS`. No code changes needed beyond that list.

## 2. Get a free Gemini API key

Go to <https://aistudio.google.com/apikey> and generate a free key
(no credit card required). This powers the AI extraction step.

## 3. Run the scraper locally (optional)

```bash
cd scraper
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then paste your GEMINI_API_KEY into .env
python scrape.py
```

This writes/updates `data/hackathons.json`. Copy it into the frontend to
preview locally:

```bash
mkdir -p ../frontend/public/data
cp ../data/hackathons.json ../frontend/public/data/hackathons.json
```

## 4. Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL — filter hackathons by region, mode, and type,
or search by title/theme/organizer.

## 5. Host it for free

**A. Automated scraping — GitHub Actions**
`.github/workflows/scrape.yml` runs the scraper on a daily cron
(edit the schedule as you like) and commits the refreshed
`data/hackathons.json` back to the repo. Add your key once as a repo
secret: **Settings → Secrets and variables → Actions → New repository
secret** → name it `GEMINI_API_KEY`.

**B. Free hosting — GitHub Pages**
`.github/workflows/deploy.yml` builds the React app and publishes it to
GitHub Pages whenever `frontend/` or the data file changes.
Enable it once: **Settings → Pages → Source → GitHub Actions**.

That's it — after both are enabled, the site keeps itself up to date with
zero paid infrastructure: GitHub Actions (free minutes on public repos) +
GitHub Pages (free static hosting) + Gemini API (free tier).

## Data schema

Every hackathon object in `data/hackathons.json` follows:

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

## Project layout

```
scraper/            Python scraping + AI extraction pipeline
  sources.py           ← add URLs here
  fetch_page.py         page → clean text
  ai_extract.py         clean text → structured JSON (Gemini)
  scrape.py              orchestrator, writes data/hackathons.json
data/hackathons.json  Latest scraped dataset (checked into repo)
frontend/            React + Vite + Tailwind portal
.github/workflows/    scrape.yml (cron scraper), deploy.yml (Pages deploy)
```

## Swapping the AI provider

`ai_extract.py` is intentionally small. To use another free-tier LLM
(e.g. Groq's Llama models), replace `_get_model()`/`extract_hackathons()`
with an equivalent call — the JSON schema/prompt stays the same.

## License

Open source — use, fork, and extend freely.

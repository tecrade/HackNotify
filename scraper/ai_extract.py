"""
AI extraction pipeline.

Sends clean Markdown/JSON text to Gemini Flash and returns structured JSON
matching our fixed schema. Includes robust retries, high-demand (503/429) backoff,
and model fallbacks.
"""

import json
import os
import re
import random
import time
from typing import Any, Dict, List

from google import genai
from google.genai import types

from fetch_page import chunk_text

PRIMARY_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-2.0-flash", "gemini-1.5-flash"]
# Deduplicate while preserving order
MODELS_TO_TRY = list(dict.fromkeys(FALLBACK_MODELS))

SCHEMA_INSTRUCTIONS = """
You are a precise information-extraction engine. You will be given clean visible text,
Markdown structure, or JSON state data of a webpage listing hackathons/coding events.

Extract EVERY distinct hackathon listed and return ONLY a JSON array
where each item has EXACTLY this shape:

{
  "title": string,                     // hackathon name
  "date": string,                      // human readable, e.g. "12-14 Sep 2026". Use "TBA" if unknown.
  "venue": string,                     // physical venue/city, or "Online" if fully virtual
  "mode": "online" | "offline" | "hybrid",
  "region": "kerala" | "india" | "global",
     // "kerala" if the event is specifically located in/organized in Kerala, India
     // "india" if elsewhere in India (national scope) but not Kerala-specific
     // "global" if international / open worldwide
  "registration_url": string,          // direct link to register/apply (MUST extract anchor link if present), or "" if not found
  "prize_pool": string,                // e.g. "₹1,00,000" or "$5,000". Use "Not specified" if unknown.
  "prize_details": string,             // short free-text breakdown (1st/2nd/3rd, perks, etc.)
  "max_participants": string,          // e.g. "500 participants" or "Team size up to 4". Use "Not specified" if unknown.
  "theme": string,                     // hackathon theme/focus area, e.g. "FinTech, Sustainability"
  "hackathon_type": "software" | "hardware" | "hybrid",
  "organizer": string,                 // organizing body/company if mentioned, else ""
  "source_url": string                 // will be filled in by the caller, leave as ""
}

Rules:
- Extract ALL distinct hackathons on the page (do not stop at 1 or 2 items).
- If the page text does not describe any hackathon at all, return an empty array: []
- Never invent facts. If a field is genuinely not present in the text, use "Not specified" (or "" for URLs).
- Output must be valid JSON matching the schema array and nothing else.
"""


def _get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Get a free key at "
            "https://aistudio.google.com/apikey and set it as an env var "
            "or GitHub Actions secret."
        )
    return genai.Client(api_key=api_key)


def _strip_code_fence(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(json)?", "", raw).strip()
    raw = re.sub(r"```$", "", raw).strip()
    return raw


def _extract_chunk_with_model(client, model_name: str, prompt: str, max_retries: int = 4) -> List[Dict[str, Any]]:
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0,
                    response_mime_type="application/json",
                ),
            )
            if response and response.text:
                raw = _strip_code_fence(response.text)
                try:
                    items = json.loads(raw)
                    return items if isinstance(items, list) else []
                except json.JSONDecodeError:
                    match = re.search(r"\[.*\]", raw, re.DOTALL)
                    if match:
                        try:
                            items = json.loads(match.group(0))
                            return items if isinstance(items, list) else []
                        except json.JSONDecodeError:
                            pass
            return []
        except Exception as e:
            err_str = str(e)
            is_transient = any(
                code in err_str
                for code in [
                    "503", "UNAVAILABLE", "429", "RESOURCE_EXHAUSTED",
                    "500", "502", "504", "overloaded", "high demand"
                ]
            )
            if is_transient and attempt < max_retries - 1:
                base_wait = 4 * (2 ** attempt) + random.uniform(0.5, 2.0)
                print(f"    [Model {model_name}] High demand / rate-limited ({err_str[:60]}...). Retrying in {base_wait:.1f}s (attempt {attempt + 1}/{max_retries})...")
                time.sleep(base_wait)
            else:
                raise e

    return []


def _extract_chunk(client, chunk_text_str: str) -> List[Dict[str, Any]]:
    prompt = f"{SCHEMA_INSTRUCTIONS}\n\nPAGE CONTENT:\n---\n{chunk_text_str}\n---"

    last_error = None
    for model_name in MODELS_TO_TRY:
        try:
            return _extract_chunk_with_model(client, model_name, prompt)
        except Exception as e:
            last_error = e
            print(f"    [Model {model_name}] Failed ({str(e)[:70]}). Trying fallback model...")
            time.sleep(1.5)

    print(f"    !! Warning: All model fallbacks failed for chunk. Error: {last_error}")
    return []


def extract_hackathons(page_text: str, source_url: str) -> List[Dict[str, Any]]:
    """Send page text to the LLM (in dynamic chunks if large) and return parsed hackathon objects."""
    if not page_text or len(page_text.strip()) < 50:
        return []

    client = _get_client()

    chunks = chunk_text(page_text, max_chars=80000)
    all_extracted = []
    seen_titles = set()

    for idx, chunk in enumerate(chunks, 1):
        if len(chunks) > 1:
            print(f"    Processing content chunk {idx}/{len(chunks)}...")

        try:
            chunk_items = _extract_chunk(client, chunk)
            for item in chunk_items:
                if not isinstance(item, dict) or not item.get("title"):
                    continue

                title_key = item.get("title", "").strip().lower()
                if title_key in seen_titles:
                    continue

                seen_titles.add(title_key)
                item["source_url"] = source_url
                item.setdefault("registration_url", "")
                all_extracted.append(item)
        except Exception as e:
            print(f"    !! Warning: Failed chunk {idx}/{len(chunks)}: {e}")

        # Respectful request pacing between chunks
        if idx < len(chunks):
            time.sleep(2)

    return all_extracted

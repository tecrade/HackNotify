"""
Lightweight, GitHub Actions-native fetching and preprocessing engine for hackathons.

Processes HTML pages (extracts embedded React/Next.js state __NEXT_DATA__, JSON-LD,
and cleans DOM into Markdown) as well as direct API JSON responses.
"""

import json
import logging
import re
import sys
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import bs4
from bs4 import BeautifulSoup
import httpx
import markdownify

logger = logging.getLogger(__name__)

# Raise recursion limit slightly to prevent bs4/markdownify issues on complex DOM trees
sys.setrecursionlimit(max(sys.getrecursionlimit(), 3000))

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7",
    "Accept-Language": "en-US,en;q=0.9",
}


class ApiJsonProcessor:
    """Formats raw API JSON payloads into clean, structured Markdown for AI extraction."""

    @classmethod
    def format_api_json(cls, data: Any, base_url: str) -> str:
        sections = ["## API JSON Response Data:"]

        if isinstance(data, list):
            sections.append(f"Total items in list: {len(data)}")
            for i, item in enumerate(data):
                item_str = json.dumps(item, indent=2, ensure_ascii=False)
                sections.append(f"### Item {i + 1}:\n```json\n{item_str}\n```")
        elif isinstance(data, dict):
            items_list = None
            list_key_name = None

            # Look for common array wrapper keys
            for key in ["challenges", "hackathons", "events", "opportunities", "items", "data", "results", "records", "content", "nodes"]:
                if key in data and isinstance(data[key], list) and len(data[key]) > 0:
                    items_list = data[key]
                    list_key_name = key
                    break

            if items_list is None:
                # Search top-level or 1-level-nested dicts for a list of dict items
                for key, val in data.items():
                    if isinstance(val, list) and len(val) > 0 and isinstance(val[0], dict):
                        items_list = val
                        list_key_name = key
                        break
                    elif isinstance(val, dict):
                        for sub_key, sub_val in val.items():
                            if isinstance(sub_val, list) and len(sub_val) > 0 and isinstance(sub_val[0], dict):
                                items_list = sub_val
                                list_key_name = f"{key}.{sub_key}"
                                break

            if items_list is not None:
                # Add metadata overview excluding the large array
                root_key = list_key_name.split(".")[0]
                meta_dict = {k: v for k, v in data.items() if k != root_key}
                if meta_dict:
                    sections.append("### API Metadata:\n```json\n" + json.dumps(meta_dict, indent=2, default=str)[:3000] + "\n```")

                sections.append(f"### Extracted List '{list_key_name}' ({len(items_list)} items):")
                for i, item in enumerate(items_list):
                    item_str = json.dumps(item, indent=2, ensure_ascii=False)
                    sections.append(f"#### Item {i + 1}:\n```json\n{item_str}\n```")
            else:
                # Single dict response
                sections.append("```json\n" + json.dumps(data, indent=2, ensure_ascii=False) + "\n```")
        else:
            sections.append(str(data))

        return "\n\n".join(sections)


class DomCleaner:
    """Cleans HTML and converts it into structured, token-efficient Markdown."""

    UNWANTED_TAGS = [
        "script", "style", "noscript", "iframe", "svg", "nav",
        "header", "footer", "aside", "canvas", "video", "audio",
        "head", "form", "button", "input"
    ]

    UNWANTED_CLASSES_OR_IDS = [
        "cookie", "banner", "navigation", "nav-menu", "footer-links",
        "modal", "popup", "newsletter", "sidebar", "ad-container"
    ]

    @classmethod
    def clean_html_to_markdown(cls, html: str, base_url: str) -> str:
        """Strips noise elements and converts DOM into semantic Markdown."""
        if not html:
            return ""

        soup = BeautifulSoup(
            html,
            "lxml" if "lxml" in bs4.builder.builder_registry.builders else "html.parser"
        )

        # Decompose unwanted tag types
        for tag_name in cls.UNWANTED_TAGS:
            for element in soup.find_all(tag_name):
                element.decompose()

        # Decompose elements matching boilerplate class or id heuristics
        for element in soup.find_all(True):
            attrs_str = (
                str(element.get("class", "")) + " " + str(element.get("id", ""))
            ).lower()
            if any(unwanted in attrs_str for unwanted in cls.UNWANTED_CLASSES_OR_IDS):
                # Preserve elements containing hackathon listing indicators
                if not any(k in attrs_str for k in ["hackathon", "event", "card", "grid", "list"]):
                    element.decompose()

        # Convert relative URLs to absolute URLs in anchor tags
        for a in soup.find_all("a", href=True):
            try:
                a["href"] = urljoin(base_url, a["href"])
            except Exception:
                pass

        # Convert cleaned HTML to Markdown safely
        try:
            md_text = markdownify.markdownify(
                str(soup),
                heading_style="ATX",
                strip=["img"],
                bullets="-",
                autolink=False
            )
        except Exception as e:
            logger.warning(f"markdownify failed for {base_url}, using text fallback: {e}")
            md_text = soup.get_text(separator="\n", strip=True)

        # Normalize whitespace and excessive newlines
        md_text = re.sub(r"\n{3,}", "\n\n", md_text)
        md_text = re.sub(r"[ \t]+", " ", md_text)
        return md_text.strip()


class EmbeddedStateExtractor:
    """Extracts React/Next.js embedded state and JSON-LD data objects."""

    @staticmethod
    def extract_next_data(html: str) -> Optional[Dict[str, Any]]:
        """Parses <script id="__NEXT_DATA__"> JSON if present."""
        soup = BeautifulSoup(html, "html.parser")
        script = soup.find("script", id="__NEXT_DATA__")
        if script and script.string:
            try:
                return json.loads(script.string)
            except Exception as e:
                logger.warning(f"Failed to parse __NEXT_DATA__: {e}")
        return None

    @staticmethod
    def extract_json_ld(html: str) -> List[Dict[str, Any]]:
        """Extracts all JSON-LD structured data objects from page."""
        soup = BeautifulSoup(html, "html.parser")
        results = []
        for script in soup.find_all("script", type="application/ld+json"):
            if script.string:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, list):
                        results.extend(data)
                    elif isinstance(data, dict):
                        results.append(data)
                except Exception:
                    continue
        return results

    @classmethod
    def format_state_as_text(cls, next_data: Optional[Dict], json_ld: List[Dict]) -> str:
        """Formats extracted raw JSON objects into structured Markdown text."""
        sections = []

        if json_ld:
            sections.append("### Structured JSON-LD Events Data:\n```json\n" + json.dumps(json_ld[:15], indent=2) + "\n```")

        if next_data:
            props = next_data.get("props", {}).get("pageProps", {})
            queries = props.get("dehydratedState", {}).get("queries", [])
            hackathon_items = []

            for q in queries:
                data = q.get("state", {}).get("data", {})
                if isinstance(data, list):
                    hackathon_items.extend(data)
                elif isinstance(data, dict):
                    for v in data.values():
                        if isinstance(v, list) and len(v) > 0 and isinstance(v[0], dict):
                            hackathon_items.extend(v)

            if hackathon_items:
                sections.append("### Next.js Embedded State Items:\n```json\n" + json.dumps(hackathon_items[:40], indent=2) + "\n```")
            else:
                props_str = json.dumps(props, default=str)[:15000]
                sections.append("### Next.js State Payload:\n```json\n" + props_str + "\n```")

        return "\n\n".join(sections)


def chunk_text(text: str, max_chars: int = 80000) -> List[str]:
    """
    Splits text dynamically on Markdown headers or card dividers
    to stay comfortably within LLM context without truncating cards.
    """
    if len(text) <= max_chars:
        return [text]

    chunks = []
    sections = re.split(r"(?=\n#{1,4}\s|\n---)", text)
    current_chunk = ""

    for sec in sections:
        if len(current_chunk) + len(sec) <= max_chars:
            current_chunk += sec
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sec

    if current_chunk:
        chunks.append(current_chunk.strip())

    # Fallback to prevent any single sub-chunk from exceeding max_chars
    final_chunks = []
    for c in chunks:
        if len(c) <= max_chars:
            final_chunks.append(c)
        else:
            sub_chunk = ""
            for line in c.splitlines(keepends=True):
                if len(sub_chunk) + len(line) <= max_chars:
                    sub_chunk += line
                else:
                    if sub_chunk:
                        final_chunks.append(sub_chunk.strip())
                    sub_chunk = line
            if sub_chunk:
                final_chunks.append(sub_chunk.strip())

    return final_chunks if final_chunks else [text[:max_chars]]


def fetch_clean_text(url: str, timeout: int = 20) -> str:
    """
    Main entrypoint: Fetches URL using httpx.
    Automatically detects API JSON responses and formats them into structured Markdown,
    or parses HTML pages to extract embedded Next.js/JSON-LD state and clean Markdown DOM.
    """
    try:
        with httpx.Client(headers=HEADERS, follow_redirects=True, timeout=timeout) as client:
            resp = client.get(url)
            resp.raise_for_status()
            raw_text = resp.text
            content_type = resp.headers.get("content-type", "").lower()
    except Exception as e:
        raise RuntimeError(f"Failed to fetch {url}: {e}")

    # Detect if response is API JSON payload
    is_json = False
    json_data = None

    if any(ct in content_type for ct in ["application/json", "text/json", "application/hal+json", "application/vnd.api+json"]):
        try:
            json_data = resp.json()
            is_json = True
        except Exception:
            pass

    if not is_json:
        stripped = raw_text.strip()
        if (stripped.startswith("{") and stripped.endswith("}")) or (stripped.startswith("[") and stripped.endswith("]")):
            try:
                json_data = json.loads(stripped)
                is_json = True
            except Exception:
                pass

    if is_json and json_data is not None:
        logger.info(f"Processing API JSON response for {url}")
        json_markdown = ApiJsonProcessor.format_api_json(json_data, url)
        if json_markdown and len(json_markdown.strip()) >= 50:
            return json_markdown

    # Process as HTML webpage
    next_data = EmbeddedStateExtractor.extract_next_data(raw_text)
    json_ld = EmbeddedStateExtractor.extract_json_ld(raw_text)
    state_markdown = EmbeddedStateExtractor.format_state_as_text(next_data, json_ld)

    # Clean HTML DOM to Markdown
    dom_markdown = DomCleaner.clean_html_to_markdown(raw_text, url)

    # Combine visible Markdown + State JSON payload
    parts = []
    if dom_markdown:
        parts.append("## Webpage Visible Content (Markdown):\n" + dom_markdown)

    if state_markdown:
        parts.append("## Embedded State / JSON Data:\n" + state_markdown)

    combined_text = "\n\n".join(parts)

    if not combined_text or len(combined_text.strip()) < 50:
        raise RuntimeError(f"Failed to extract meaningful content from {url}")

    return combined_text

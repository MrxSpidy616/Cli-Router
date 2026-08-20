import os
import re
import json
import requests
import hashlib
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from datetime import datetime

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data", "research_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Regex to detect custom research tokens in LLM stream/output
TRIGGER_PATTERN = re.compile(
    r'\[(?:WEB_SEARCH|RESEARCH_URL|FETCH_WEB|WEB_RESEARCH|URL_LOOKUP|FIRECRAWL_SEARCH):\s*([^\s\]]+(?:\s+[^\s\]]+)*)\]',
    re.IGNORECASE
)

AUTHORITATIVE_DOMAINS = [
    "who.int", "cdc.gov", "nih.gov", "ncbi.nlm.nih.gov", "medlineplus.gov",
    "nhsinform.scot", "nhs.uk", "mayoclinic.org", "hopkinsmedicine.org",
    "nice.org.uk", "thelancet.com", "nejm.org", "bmj.com", "jamanetwork.com",
    "sciencedirect.com", "cochranelibrary.com", "zenodo.org", "wikipedia.org"
]

def sanitize_filename(identifier):
    """Creates a filesystem-safe filename from a URL or query string."""
    clean_id = re.sub(r'[^a-zA-Z0-9_-]', '_', identifier)[:40]
    id_hash = hashlib.md5(identifier.encode("utf-8")).hexdigest()[:8]
    return f"research_{clean_id}_{id_hash}.md"

def bs4_html_to_markdown(html_content, source_url):
    """Fallback parser: extracts clean markdown from raw HTML using BeautifulSoup."""
    soup = BeautifulSoup(html_content, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg", "form"]):
        tag.decompose()
        
    title = soup.title.string.strip() if soup.title and soup.title.string else "Medical Document"
    main_body = soup.find("main") or soup.find("article") or soup.find("div", {"id": "content"}) or soup.body or soup
    
    lines = [
        f"# {title}\n",
        f"- **Source URL**: [{source_url}]({source_url})",
        f"- **Fetched At**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        f"- **Engine**: Local HTML/BS4 Fallback Parser\n",
        "## Extracted Clinical Information\n"
    ]
    
    for element in main_body.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        text = element.get_text(separator=" ", strip=True)
        if not text or len(text) < 15:
            continue
        
        name = element.name
        if name in ["h1", "h2"]:
            lines.append(f"\n### {text}\n")
        elif name in ["h3", "h4"]:
            lines.append(f"\n#### {text}\n")
        elif name == "li":
            lines.append(f"- {text}")
        else:
            lines.append(f"{text}\n")
            
    full_markdown = "\n".join(lines)
    if len(full_markdown) > 16000:
        full_markdown = full_markdown[:16000] + "\n\n*(... content truncated for context budget ...)*"
    return full_markdown

class WebResearcher:
    def __init__(self, api_key=None):
        self.firecrawl_api_key = api_key or os.environ.get("FIRECRAWL_API_KEY", "fc-bfc1c5abb4aa4f69b0da8f12c5b444d6")
        self.firecrawl_base_url = "https://api.firecrawl.dev/v1"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Clinical-Decision-Support-RAG/2.0)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

    def detect_triggers(self, text):
        """Finds any custom web research trigger tokens in LLM output."""
        if not text:
            return []
        matches = TRIGGER_PATTERN.findall(text)
        cleaned = []
        for m in matches:
            query_cand = m.strip("'\">)] ")
            if query_cand and query_cand not in cleaned:
                cleaned.append(query_cand)
        return cleaned

    def scrape_with_firecrawl(self, target_url):
        """Scrapes a URL using Firecrawl API to extract high-fidelity clean Markdown."""
        if not self.firecrawl_api_key:
            raise ValueError("Firecrawl API key not configured.")

        endpoint = f"{self.firecrawl_base_url}/scrape"
        headers = {
            "Authorization": f"Bearer {self.firecrawl_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "url": target_url,
            "formats": ["markdown"]
        }

        resp = requests.post(endpoint, headers=headers, json=payload, timeout=25)
        if resp.status_code != 200:
            raise Exception(f"Firecrawl scrape API error {resp.status_code}: {resp.text}")

        data = resp.json()
        if not data.get("success", False):
            raise Exception(f"Firecrawl scrape failed: {data.get('error', 'Unknown error')}")

        doc_data = data.get("data", {})
        raw_markdown = doc_data.get("markdown", "")
        metadata = doc_data.get("metadata", {})
        title = metadata.get("title") or "Medical Research Document"

        # Format header with audit trail
        final_markdown = (
            f"# {title}\n\n"
            f"- **Source URL**: [{target_url}]({target_url})\n"
            f"- **Fetched At**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n"
            f"- **Scraping Engine**: Firecrawl v1 High-Fidelity Markdown\n\n"
            f"{raw_markdown}"
        )

        return {
            "markdown": final_markdown,
            "title": title,
            "metadata": metadata
        }

    def search_with_firecrawl(self, query, limit=3):
        """Conducts deep web research across authoritative sources using Firecrawl Search API."""
        if not self.firecrawl_api_key:
            raise ValueError("Firecrawl API key not configured.")

        endpoint = f"{self.firecrawl_base_url}/search"
        headers = {
            "Authorization": f"Bearer {self.firecrawl_api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "query": query,
            "limit": limit,
            "scrapeOptions": {
                "formats": ["markdown"]
            }
        }

        resp = requests.post(endpoint, headers=headers, json=payload, timeout=30)
        if resp.status_code != 200:
            raise Exception(f"Firecrawl search API error {resp.status_code}: {resp.text}")

        data = resp.json()
        if not data.get("success", False):
            raise Exception(f"Firecrawl search failed: {data.get('error', 'Unknown error')}")

        results = data.get("data", [])
        return results

    def fetch_and_convert(self, url_or_query):
        """
        Main research dispatcher:
        1. If direct URL -> Scrapes via Firecrawl, with BS4 fallback.
        2. If query topic -> Searches via Firecrawl Search, compiling top sources into unified markdown.
        """
        target = url_or_query.strip()
        is_url = target.startswith("http://") or target.startswith("https://") or ("." in target and "/" in target and " " not in target)

        if not is_url and not target.startswith("http"):
            # It's a search topic/query
            return self._execute_search_research(target)
        else:
            # It's a direct URL
            if not target.startswith("http"):
                target = "https://" + target
            return self._execute_url_scrape(target)

    def _execute_url_scrape(self, target_url):
        engine_used = "Firecrawl v1"
        try:
            # 1. Try Firecrawl Scrape
            res = self.scrape_with_firecrawl(target_url)
            md_content = res["markdown"]
        except Exception as fc_err:
            # 2. Fallback to Local BS4 Scraper
            engine_used = f"Local BS4 (Firecrawl fallback: {str(fc_err)[:60]})"
            try:
                resp = requests.get(target_url, headers=self.headers, timeout=12, allow_redirects=True)
                if resp.status_code == 200:
                    md_content = bs4_html_to_markdown(resp.text, target_url)
                else:
                    return {
                        "success": False,
                        "url": target_url,
                        "engine": engine_used,
                        "error": f"HTTP status {resp.status_code} ({resp.reason})",
                        "markdown": f"Failed to fetch content from {target_url}: HTTP {resp.status_code}"
                    }
            except Exception as bs4_err:
                return {
                    "success": False,
                    "url": target_url,
                    "engine": engine_used,
                    "error": f"Scrape failed: {str(bs4_err)}",
                    "markdown": f"Error accessing {target_url}: {str(bs4_err)}"
                }

        # Cache markdown to local directory
        filename = sanitize_filename(target_url)
        filepath = os.path.join(CACHE_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_content)

        domain = urlparse(target_url).netloc
        is_authoritative = any(d in domain for d in AUTHORITATIVE_DOMAINS)

        return {
            "success": True,
            "url": target_url,
            "filename": filename,
            "filepath": filepath,
            "domain": domain,
            "authoritative": is_authoritative,
            "engine": engine_used,
            "markdown": md_content,
            "char_count": len(md_content),
            "error": None
        }

    def _execute_search_research(self, query):
        engine_used = "Firecrawl Search API"
        compiled_lines = [
            f"# Web Research Brief: {query}\n",
            f"- **Search Query**: `{query}`",
            f"- **Timestamp**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            f"- **Engine**: Firecrawl Deep Web Search\n",
            "## Summary of Findings from Authoritative Sources\n"
        ]

        try:
            results = self.search_with_firecrawl(query, limit=3)
            if not results:
                raise Exception("No search results returned by Firecrawl.")

            for i, r in enumerate(results, 1):
                r_url = r.get("url", "Unknown URL")
                r_title = r.get("title", f"Source {i}")
                r_md = r.get("markdown", "")
                compiled_lines.append(f"### Source {i}: [{r_title}]({r_url})\n")
                compiled_lines.append(f"{r_md[:2500]}\n")

            full_markdown = "\n".join(compiled_lines)

        except Exception as fc_err:
            engine_used = f"MedlinePlus Fallback (Firecrawl Search failed: {str(fc_err)[:60]})"
            # Fallback to NIH MedlinePlus search URL
            clean_q = requests.utils.quote(query)
            fallback_url = f"https://medlineplus.gov/search?query={clean_q}"
            return self._execute_url_scrape(fallback_url)

        # Cache search brief
        filename = sanitize_filename(f"search_{query}")
        filepath = os.path.join(CACHE_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(full_markdown)

        return {
            "success": True,
            "url": f"search://{query}",
            "query": query,
            "filename": filename,
            "filepath": filepath,
            "domain": "firecrawl.dev/search",
            "authoritative": True,
            "engine": engine_used,
            "markdown": full_markdown,
            "char_count": len(full_markdown),
            "error": None
        }

    def process_llm_stream_or_text(self, initial_output):
        """Checks for trigger tokens, executes real-time research, and prepares injection context."""
        queries = self.detect_triggers(initial_output)
        if not queries:
            return None, []

        research_results = []
        for q in queries:
            res = self.fetch_and_convert(q)
            research_results.append(res)

        # Build injection markdown block
        injection_blocks = ["\n\n<web_research_context>\n### 🌐 Real-Time Firecrawl Web Research & Clinical Guidelines Retrieved:"]
        for res in research_results:
            if res["success"]:
                auth_badge = "✅ [Verified Authoritative Source]" if res.get("authoritative") else "ℹ️ [External Source]"
                engine_badge = f"⚡ [{res.get('engine', 'Firecrawl')}]"
                injection_blocks.append(f"\n#### Query/Source: {res['url']} {auth_badge} {engine_badge}\n```markdown\n{res['markdown'][:3500]}\n```\n")
            else:
                injection_blocks.append(f"\n- Target `{res['url']}`: {res.get('error')} (Engine: {res.get('engine')})")
        injection_blocks.append("</web_research_context>\n")
        
        return "\n".join(injection_blocks), research_results

# Global singleton
web_researcher = WebResearcher()

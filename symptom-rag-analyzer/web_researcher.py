import re
import os
import requests
import hashlib
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from datetime import datetime

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data", "research_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Custom trigger words supported in LLM output stream
TRIGGER_PATTERN = re.compile(
    r'\[(?:WEB_SEARCH|RESEARCH_URL|FETCH_WEB|WEB_RESEARCH|URL_LOOKUP):\s*([^\s\]]+)\]',
    re.IGNORECASE
)

AUTHORITATIVE_DOMAINS = [
    "who.int", "cdc.gov", "nih.gov", "ncbi.nlm.nih.gov", "medlineplus.gov",
    "mayoclinic.org", "hopkinsmedicine.org", "nice.org.uk", "thelancet.com", "nejm.org"
]

def sanitize_filename(url):
    parsed = urlparse(url)
    domain = parsed.netloc.replace(".", "_")
    path_hash = hashlib.md5(url.encode("utf-8")).hexdigest()[:8]
    return f"research_{domain}_{path_hash}.md"

def html_to_markdown(html_content, source_url):
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Remove clutter
    for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript", "svg", "form"]):
        tag.decompose()
        
    title = soup.title.string.strip() if soup.title and soup.title.string else "Medical Research Document"
    
    # Try finding main article container
    main_body = soup.find("main") or soup.find("article") or soup.find("div", {"id": "content"}) or soup.body or soup
    
    lines = []
    lines.append(f"# {title}\n")
    lines.append(f"- **Source URL**: [{source_url}]({source_url})")
    lines.append(f"- **Fetched At**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}\n")
    lines.append("## Extracted Clinical Information\n")
    
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
            
    # Cap size to avoid flooding context while keeping rich data (~4000 words)
    full_markdown = "\n".join(lines)
    if len(full_markdown) > 16000:
        full_markdown = full_markdown[:16000] + "\n\n*(... content truncated for context budget ...)*"
        
    return full_markdown

class WebResearcher:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Clinical-Decision-Support-RAG/1.0)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }

    def detect_triggers(self, text):
        """Finds any custom web research trigger words in LLM output."""
        matches = TRIGGER_PATTERN.findall(text)
        cleaned = []
        for m in matches:
            url_cand = m.strip("'\">)] ")
            if url_cand and url_cand not in cleaned:
                cleaned.append(url_cand)
        return cleaned

    def fetch_and_convert(self, url_or_query):
        """Fetches a target URL, converts to markdown, and stores into research cache."""
        target_url = url_or_query.strip()
        
        # If bare domain or search query without protocol, format it
        if not target_url.startswith("http://") and not target_url.startswith("https://"):
            if "." in target_url and "/" in target_url:
                target_url = "https://" + target_url
            else:
                # Construct query lookup to NIH MedlinePlus / PubMed
                clean_q = requests.utils.quote(target_url)
                target_url = f"https://medlineplus.gov/search?query={clean_q}"

        try:
            resp = requests.get(target_url, headers=self.headers, timeout=12, allow_redirects=True)
            if resp.status_code == 200:
                md_content = html_to_markdown(resp.text, target_url)
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
                    "markdown": md_content,
                    "char_count": len(md_content),
                    "error": None
                }
            else:
                return {
                    "success": False,
                    "url": target_url,
                    "error": f"HTTP status {resp.status_code} ({resp.reason})",
                    "markdown": f"Failed to fetch content from {target_url}: HTTP {resp.status_code}"
                }
        except Exception as e:
            return {
                "success": False,
                "url": target_url,
                "error": str(e),
                "markdown": f"Error accessing {target_url}: {str(e)}"
            }

    def process_llm_stream_or_text(self, initial_output):
        """Checks for trigger words, resolves all URLs, and produces injection context."""
        urls = self.detect_triggers(initial_output)
        if not urls:
            return None, []

        research_results = []
        for url in urls:
            res = self.fetch_and_convert(url)
            research_results.append(res)

        # Build injection markdown block
        injection_blocks = ["\n\n<web_research_context>\n### 🌐 Real-Time Web Research & Guidelines Retrieved:"]
        for res in research_results:
            if res["success"]:
                auth_badge = "✅ [Verified Authoritative Source]" if res.get("authoritative") else "ℹ️ [External Source]"
                injection_blocks.append(f"\n#### Source: {res['url']} {auth_badge}\n```markdown\n{res['markdown'][:3000]}\n```\n")
            else:
                injection_blocks.append(f"\n- Target `{res['url']}`: {res.get('error')}")
        injection_blocks.append("</web_research_context>\n")
        
        return "\n".join(injection_blocks), research_results

web_researcher = WebResearcher()

import time
from scraper.overlays import close_overlays
from utils.logger import log


def open_site_and_search(page, title):
    log("SEARCH", f"Loading site for: {title}")

    try:
        page.goto("https://videodownloader.site/", wait_until="commit", timeout=90000)
        log("SEARCH", "Page committed")
    except Exception as e:
        log("WARN", f"goto warning: {e}")

    try:
        page.wait_for_load_state("domcontentloaded", timeout=30000)
    except:
        pass

    # Skip networkidle on Render — it's too slow and often never fires
    # domcontentloaded is enough to interact with the search box
    close_overlays(page)

    # Wait for any text input to appear
    page.wait_for_selector("input[type='text'], input[type='search']", state="attached", timeout=30000)

    # Try multiple input selectors — site may update placeholders
    input_selectors = [
        "input[placeholder*='Search video']",
        "input[placeholder*='movie']",
        "input[placeholder*='TV']",
        "input[placeholder*='search']",
        "input[type='search']",
        "input[type='text']",   # last resort — any text input
    ]

    filled = False
    for sel in input_selectors:
        try:
            inp = page.locator(sel).first
            inp.wait_for(state="visible", timeout=4000)
            inp.click(force=True)
            page.wait_for_timeout(200)
            inp.fill("")
            inp.type(title, delay=60)
            filled = True
            log("SEARCH", f"Typed into: {sel}")
            break
        except:
            continue

    if not filled:
        # JS fallback
        log("SEARCH", "Using JS fallback to fill input")
        page.evaluate(f"""
            const inputs = document.querySelectorAll("input[type='text'], input[type='search']");
            for (const el of inputs) {{
                if (el.offsetParent !== null) {{  // visible check
                    el.focus();
                    el.value = {repr(title)};
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                    el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                    break;
                }}
            }}
        """)

    page.wait_for_timeout(1000)

    # Click suggestion if it appears, otherwise press Enter
    try:
        suggestion = page.locator(
            "li[class*='result'], div[class*='suggestion'], "
            "div[class*='result'], a[class*='result'], "
            "ul[class*='suggest'] li, div[class*='autocomplete'] div"
        ).first
        suggestion.wait_for(timeout=3000)
        suggestion.click()
        log("SEARCH", "Clicked autocomplete suggestion")
    except:
        log("SEARCH", "No suggestion found — pressing Enter")
        page.keyboard.press("Enter")

    # Wait for results to load — look for cards or the download button
    try:
        page.wait_for_function(
            """document.querySelector('[class*="card"]') ||
               document.querySelector('button[class*="primary"]') ||
               document.querySelector('button')""",
            timeout=15000
        )
    except:
        pass

    page.wait_for_timeout(1500)
    log("SEARCH", f"Search complete for: {title}")

from utils.logger import log


def click_download_button(page):
    log("DOWNLOAD", "Looking for Download button...")

    # Try multiple selectors in order — site HTML changes over time
    # If one fails, try the next
    selectors = [
        "button.button-primary:has-text('Download')",      # original
        "button:has-text('Download')",                      # any button with Download text
        "a:has-text('Download')",                           # anchor tag version
        "[class*='download']:has-text('Download')",        # any element with download in class
        "button[class*='primary']",                         # any primary button
        "button:has-text('Get')",                           # some sites say "Get Download"
        "button:has-text('Fetch')",                         # or "Fetch"
    ]

    for selector in selectors:
        try:
            btn = page.locator(selector).first
            btn.wait_for(state="visible", timeout=8000)
            btn.scroll_into_view_if_needed()
            page.wait_for_timeout(400)
            btn.click()
            page.wait_for_timeout(1500)
            log("DOWNLOAD", f"Clicked with selector: {selector}")
            return  # success — stop trying
        except Exception as e:
            log("DOWNLOAD", f"Selector failed ({selector}): {e}")
            continue

    # Last resort — find any button on page containing download-related text via JS
    log("DOWNLOAD", "Trying JS fallback to find any Download button...")
    clicked = page.evaluate("""
        () => {
            const keywords = ['download', 'get link', 'fetch', 'get file'];
            const buttons = [...document.querySelectorAll('button, a[href], [role="button"]')];
            for (const btn of buttons) {
                const text = btn.textContent.toLowerCase().trim();
                if (keywords.some(k => text.includes(k))) {
                    btn.scrollIntoView();
                    btn.click();
                    return btn.textContent.trim();
                }
            }
            return null;
        }
    """)

    if clicked:
        log("DOWNLOAD", f"JS fallback clicked: '{clicked}'")
        page.wait_for_timeout(1500)
        return

    # Dump what buttons exist on the page to help debug
    buttons_found = page.evaluate("""
        () => [...document.querySelectorAll('button')].map(b => ({
            text: b.textContent.trim().slice(0, 60),
            classes: b.className
        }))
    """)
    log("DOWNLOAD", f"No Download button found. Buttons on page: {buttons_found}")
    raise Exception(
        f"Could not find Download button. "
        f"Buttons found on page: {[b['text'] for b in buttons_found[:10]]}"
    )

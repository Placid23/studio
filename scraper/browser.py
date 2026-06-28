from utils.logger import log


def make_browser(playwright):
    browser = playwright.chromium.launch(
        headless=True,
        args=[
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-blink-features=AutomationControlled",  # avoid bot detection
            "--disable-gpu",
            "--single-process",          # lower RAM on Render free tier
        ]
    )
    # Spoof a real browser so the site doesn't block the scraper
    context = browser.new_context(
        viewport={"width": 1280, "height": 800},
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        extra_http_headers={
            "Accept-Language": "en-US,en;q=0.9",
        }
    )
    page = context.new_page()
    page.set_default_timeout(90000)
    page.set_default_navigation_timeout(90000)
    log("BROWSER", "Browser launched")
    return browser, page

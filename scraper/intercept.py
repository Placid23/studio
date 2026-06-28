import time
from utils.logger import log


def intercept_download_url(page, all_btns, quality_index):
    download_url = None
    captured_headers = {}

    def handle_request(request):
        nonlocal captured_headers
        url = request.url
        if any(x in url for x in [".mp4", ".mkv", ".avi", ".webm", "download", "cdn", "stream"]):
            captured_headers = dict(request.headers)
            log("INTERCEPT", f"Captured request headers for: {url}")

    def handle_response(response):
        nonlocal download_url
        url = response.url
        if any(x in url for x in [".mp4", ".mkv", ".avi", ".webm", "download", "cdn", "stream"]):
            if response.status in [200, 206, 302]:
                download_url = url
                log("LINK", f"Captured → {url}")

    page.on("request", handle_request)
    page.on("response", handle_response)
    all_btns.nth(quality_index).click()

    log("INTERCEPT", "Waiting for download URL...")
    for _ in range(20):
        if download_url:
            break
        time.sleep(0.5)

    page.remove_listener("request", handle_request)
    page.remove_listener("response", handle_response)

    # DOM fallback
    if not download_url:
        log("INTERCEPT", "Trying DOM fallback")
        try:
            link = page.locator("a[href*='.mp4'], a[href*='download'], a[download]").first
            link.wait_for(timeout=6000)
            download_url = link.get_attribute("href")
            log("INTERCEPT", f"DOM fallback → {download_url}")
        except:
            pass

    return download_url, captured_headers
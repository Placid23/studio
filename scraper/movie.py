from scraper.quality import get_quality_options
from scraper.intercept import intercept_download_url
from utils.logger import log


def resolve_movie(page, quality):
    page.wait_for_selector("div.grid button.rounded-2xl", timeout=15000)
    page.wait_for_timeout(500)

    all_btns, qualities = get_quality_options(page)

    quality_index = qualities[0]["index"] if qualities else 0
    for q in qualities:
        if q["resolution"].upper() == quality.upper():
            quality_index = q["index"]
            break

    log("MOVIE", f"Resolving quality: {quality} at index {quality_index}")
    url, headers = intercept_download_url(page, all_btns, quality_index)
    return url, headers
from flask import Blueprint, request, jsonify
from playwright.sync_api import sync_playwright
from scraper.browser import make_browser
from scraper.search import open_site_and_search
from scraper.downloader import click_download_button
from scraper.quality import get_quality_options
from scraper.series import get_seasons, get_episodes

options_bp = Blueprint("options", __name__)


@options_bp.route("/options", methods=["POST"])
def get_options():
    data   = request.json
    title  = data.get("title", "")
    c_type = data.get("type", "auto")

    with sync_playwright() as p:
        browser, page = make_browser(p)
        try:
            open_site_and_search(page, title)
            click_download_button(page)

            page.wait_for_selector(
                "div.grid button.rounded-2xl, div.space-y-4",
                timeout=15000
            )
            page.wait_for_timeout(800)

            is_series = page.locator("p:has-text('Season')").count() > 0

            if is_series or c_type == "series":
                seasons  = get_seasons(page)
                episodes = get_episodes(page)
                browser.close()
                return jsonify({
                    "type": "series",
                    "seasons": seasons,
                    "episodes": episodes
                })
            else:
                page.wait_for_selector("div.grid button.rounded-2xl", timeout=10000)
                _, qualities = get_quality_options(page)
                browser.close()
                return jsonify({"type": "movie", "qualities": qualities})

        except Exception as e:
            browser.close()
            return jsonify({"error": str(e)}), 500
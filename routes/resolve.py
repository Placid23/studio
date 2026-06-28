from flask import Blueprint, request, jsonify
from playwright.sync_api import sync_playwright
from scraper.browser import make_browser
from scraper.search import open_site_and_search
from scraper.downloader import click_download_button
from scraper.series import select_season, select_episode
from scraper.movie import resolve_movie

resolve_bp = Blueprint("resolve", __name__)


@resolve_bp.route("/resolve", methods=["POST"])
def resolve():
    data    = request.json
    title   = data.get("title", "")
    c_type  = data.get("type", "movie")
    season  = data.get("season")
    episode = data.get("episode")
    quality = data.get("quality", "720P")

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

            if c_type == "series":
                select_season(page, season)
                select_episode(page, episode)

            url, headers = resolve_movie(page, quality)
            browser.close()

            if url:
                # Send URL + browser headers back to Next.js
                # so the stream proxy can impersonate a real browser
                return jsonify({
                    "url": url,
                    "quality": quality,
                    "headers": headers   # ← key addition
                })
            else:
                return jsonify({"error": "Could not retrieve download link"}), 500

        except Exception as e:
            browser.close()
            return jsonify({"error": str(e)}), 500
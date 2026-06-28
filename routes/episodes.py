from flask import Blueprint, request, jsonify
from playwright.sync_api import sync_playwright
from scraper.browser import make_browser
from scraper.search import open_site_and_search
from scraper.downloader import click_download_button
from scraper.series import select_season, get_episodes

episodes_bp = Blueprint("episodes", __name__)


@episodes_bp.route("/episodes", methods=["POST"])
def get_episodes_route():
    data   = request.json
    title  = data.get("title", "")
    season = data.get("season", "Season 1")

    with sync_playwright() as p:
        browser, page = make_browser(p)
        try:
            open_site_and_search(page, title)
            click_download_button(page)
            page.wait_for_selector("div.space-y-4", timeout=15000)
            select_season(page, season)
            episodes = get_episodes(page)
            browser.close()
            return jsonify({"episodes": episodes})

        except Exception as e:
            browser.close()
            return jsonify({"error": str(e)}), 500
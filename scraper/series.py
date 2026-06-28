from utils.logger import log


def get_seasons(page):
    season_btn = page.locator("div.space-y-4 button[type='button']").first
    current = season_btn.locator("span").first.inner_text().strip()

    season_btn.click()
    page.wait_for_timeout(600)

    opts = page.locator(
        "ul[role='listbox'] li, div[role='menu'] button, div[class*='dropdown'] button"
    )

    seasons = []
    try:
        opts.first.wait_for(timeout=3000)
        for i in range(opts.count()):
            txt = opts.nth(i).inner_text().strip()
            if txt:
                seasons.append(txt)
    except:
        seasons = [current]

    page.keyboard.press("Escape")
    page.wait_for_timeout(300)

    log("SERIES", f"Seasons found: {seasons}")
    return seasons


def select_season(page, season):
    season_btn = page.locator("div.space-y-4 button[type='button']").first
    current = season_btn.locator("span").first.inner_text().strip()

    if current == season:
        log("SERIES", f"Already on {season}")
        return

    season_btn.click()
    page.wait_for_timeout(600)

    opts = page.locator(
        "ul[role='listbox'] li, div[role='menu'] button, div[class*='dropdown'] button"
    )

    for i in range(opts.count()):
        if opts.nth(i).inner_text().strip() == season:
            opts.nth(i).click()
            log("SERIES", f"Selected season: {season}")
            break

    page.wait_for_timeout(1200)


def get_episodes(page):
    ep_btns = page.locator("div.flex.flex-wrap.gap-2 button[type='button']")
    episodes = [ep_btns.nth(i).inner_text().strip() for i in range(ep_btns.count())]
    log("SERIES", f"Episodes found: {episodes}")
    return episodes


def select_episode(page, episode):
    ep_btns = page.locator("div.flex.flex-wrap.gap-2 button[type='button']")
    for i in range(ep_btns.count()):
        if ep_btns.nth(i).inner_text().strip() == str(episode):
            ep_btns.nth(i).click()
            log("SERIES", f"Selected episode: {episode}")
            break
    page.wait_for_timeout(1500)
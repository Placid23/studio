import re


def get_quality_options(page):
    resolution_pattern = re.compile(r"^\d{3,4}[pP]$|^4K$|^2K$")
    all_btns = page.locator("div.grid button.rounded-2xl")
    count = all_btns.count()
    qualities = []

    for i in range(count):
        btn = all_btns.nth(i)
        try:
            first = btn.locator("div").nth(0).inner_text().strip()
            if resolution_pattern.match(first):
                fmt  = btn.locator("div").nth(1).inner_text().strip()
                size = btn.locator("div").nth(2).inner_text().strip()
                qualities.append({
                    "index": i,
                    "resolution": first,
                    "format": fmt,
                    "size": size
                })
        except:
            continue

    return all_btns, qualities
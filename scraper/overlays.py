def close_overlays(page):
    try:
        page.keyboard.press("Escape")
        page.wait_for_timeout(600)
    except: pass

    try:
        btn = page.locator("button.absolute.right-4.top-4, button:has-text('×')")
        if btn.count() > 0:
            btn.first.click()
            page.wait_for_timeout(600)
    except: pass
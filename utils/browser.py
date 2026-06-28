from playwright.sync_api import sync_playwright

def search_movie(movie_name):
    with sync_playwright() as p:

        brave_path = r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe"

        browser = p.chromium.launch(
            executable_path=brave_path,
            headless=False,
            slow_mo=300
        )

        page = browser.new_page()

        page.goto("https://moviebox.ph", wait_until="domcontentloaded")

        page.wait_for_timeout(4000)

        search_input = page.get_by_placeholder("Search movies/ TV Shows")

        search_input.fill(movie_name)
        search_input.press("Enter")

        print("Searching with Brave...")

        input("Press ENTER to close...")
        browser.close()


if __name__ == "__main__":
    movie = input("Enter movie name: ")
    search_movie(movie)
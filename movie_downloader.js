/**
 * movie_downloader.js
 *
 * Automates downloading movies from a specified site using Puppeteer.
 * Designed to run in serverless environments using @sparticuz/chromium.
 */

import fs from "fs";
import path from "path";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// CLI arguments
const argv = yargs(hideBin(process.argv))
  .option("site", { type: "string", demandOption: true })
  .option("query", { type: "string", demandOption: true })
  .option("out", { type: "string", demandOption: true })
  .option("headless", { type: "boolean", default: true })
  .help()
  .argv;

// Config selectors
const CONFIG = {
  searchBoxSelector: "#searchname",
  resultsListSelector: "a[href*='movie-']",
  qualityLinkSelector: "#downloadoptionslink2",
  maxWait: 30000,
};

const DOWNLOADS_FOLDER = path.resolve(process.cwd(), "downloads");

// Ensure downloads folder exists
if (!fs.existsSync(DOWNLOADS_FOLDER)) {
  fs.mkdirSync(DOWNLOADS_FOLDER, { recursive: true });
}

// 🔧 Always get the currently active fzmovies page
async function getActivePage(browser) {
  const pages = await browser.pages();
  const fzPage = pages.find((p) => p.url().includes("fzmovies")) || pages[0];
  await fzPage.bringToFront();
  return fzPage;
}

// 🔧 Resilient navigation helper
async function safeNavigate(browser, action, label) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let currentPage = await getActivePage(browser);
      console.log(`🌍 Navigating (${label}) attempt ${attempt}`);
      await Promise.all([
        currentPage.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: CONFIG.maxWait,
        }),
        action(currentPage),
      ]);
      currentPage = await getActivePage(browser);
      console.log(`🔗 [${label}] now at ${currentPage.url()}`);
      return currentPage;
    } catch (err) {
      console.warn(`⚠ Navigation failed (${label}): ${err.message}`);
      try {
        const currentPage = await getActivePage(browser);
        await currentPage.screenshot({
          path: `debug_${label}_${attempt}.png`,
        });
        console.log(`📸 Saved debug screenshot: debug_${label}_${attempt}.png`);
      } catch (sErr) {
        console.warn("❌ Failed to capture screenshot:", sErr.message);
      }
      if (attempt === 3) throw err;
    }
  }
}

// Helper: Wait until a file exists and is fully downloaded
function waitForDownload(fileName, folder) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearInterval(interval);
      reject(
        new Error(
          `Download timed out for ${fileName} after ${
            CONFIG.maxWait / 1000
          } seconds.`
        )
      );
    }, CONFIG.maxWait * 2);

    const interval = setInterval(() => {
      try {
        const files = fs.readdirSync(folder);
        const targetFile = files.find(
          (f) => f === fileName && !f.endsWith(".crdownload")
        );
        if (targetFile) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(path.join(folder, targetFile));
        }
      } catch (e) {
        // Ignore errors if folder doesn't exist yet
      }
    }, 1000);
  });
}

// Main download function
async function downloadMovie(site, query, outPath) {
  let browser = null;
  try {
    const executablePath = await chromium.executablePath();

    if (!executablePath) {
      throw new Error(
        "Could not find a Chromium executable. The @sparticuz/chromium package may be missing or failed to install correctly."
      );
    }

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    // 🛡 Close unwanted popups / ad redirects
    browser.on("targetcreated", async (target) => {
      const newPage = await target.page();
      if (!newPage) return;
      if (newPage.url().includes("fzmovies")) {
        console.log("🔄 Switching context to new fzmovies page:", newPage.url());
        await newPage.bringToFront();
      } else {
        console.log("❌ Closing popup:", newPage.url());
        try {
          await newPage.close();
        } catch (e) {
          console.warn("Could not close popup, it may have been closed already.");
        }
      }
    });

    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOADS_FOLDER,
    });

    // Step 1: Go to site and search
    await page.goto(site, {
      waitUntil: "networkidle2",
      timeout: CONFIG.maxWait,
    });

    await page.waitForSelector(CONFIG.searchBoxSelector, {
      timeout: CONFIG.maxWait,
    });
    const searchBox = await page.$(CONFIG.searchBoxSelector);
    await searchBox.click({ clickCount: 3 });
    await searchBox.type(query, { delay: 80 });
    
    page = await safeNavigate(browser, async (p) => {
        await p.keyboard.press("Enter");
    }, "Search results");

    // Step 2: Click first movie result
    await page.waitForSelector(CONFIG.resultsListSelector, {
      timeout: CONFIG.maxWait,
    });
    
    page = await safeNavigate(
      browser,
      async (p) => {
        const searchResults = await p.$$(CONFIG.resultsListSelector);
        if (!searchResults.length) throw new Error("No search results found.");
        await searchResults[0].click();
      },
      "First movie result"
    );

    // Step 3: Click 720p download option
    await page.waitForSelector(CONFIG.qualityLinkSelector, {
      timeout: CONFIG.maxWait,
    });
    page = await safeNavigate(
      browser,
      async (p) => {
        await p.click(CONFIG.qualityLinkSelector);
      },
      "720p option"
    );

    // Step 4: Follow intermediate pages until final dlink.php
    while (true) {
      await page.waitForFunction(
        () => {
          return (
            document.querySelector('a[href*="dlink.php"]') ||
            document.querySelector('a[onclick*="window.location.href"]')
          );
        },
        { timeout: CONFIG.maxWait }
      );

      const finalLink = await page.$('a[href*="dlink.php"]');
      if (finalLink) {
        // This is a direct download link, no navigation expected
        await finalLink.click();
        break;
      }

      const intermediateLink = await page.$(
        'a[onclick*="window.location.href"]'
      );
      if (intermediateLink) {
        page = await safeNavigate(
          browser,
          async (p) => {
            const iLink = await p.$('a[onclick*="window.location.href"]');
            await iLink.click();
          },
          "Intermediate link"
        );
      } else {
        throw new Error(
          "Cannot find final download link or next intermediate link."
        );
      }
    }

    console.log(
      `Download triggered for ${path.basename(
        outPath
      )}. Waiting for file to complete...`
    );

    const fileName = path.basename(outPath);
    const downloadedFilePath = await waitForDownload(
      fileName,
      DOWNLOADS_FOLDER
    );

    console.log("✅ Download completed:", downloadedFilePath);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

// Run the script
(async () => {
  try {
    const site = argv.site;
    const query = argv.query;
    const out = path.join(DOWNLOADS_FOLDER, argv.out);

    console.log(`🎬 Searching for "${query}"...`);
    await downloadMovie(site, query, out);
    console.log(`🎉 Successfully downloaded "${query}" to ${out}`);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
    process.exit(1);
  }
})();

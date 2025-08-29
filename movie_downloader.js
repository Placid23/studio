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

// Utility: always get latest active page
async function getActivePage(browser) {
  const pages = await browser.pages();
  return pages[pages.length - 1];
}

// Utility: log current page URL
async function logPageUrl(browser, label) {
  const currentPage = await getActivePage(browser);
  console.log(`🔗 [${label}] ${currentPage.url()}`);
}

// Safe click wrapper with retry and URL logging
async function safeClick(browser, selector, label = selector) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const currentPage = await getActivePage(browser);
      console.log(`➡ Waiting for ${label} (attempt ${attempt})`);
      await currentPage.waitForSelector(selector, { timeout: CONFIG.maxWait });
      const el = await currentPage.$(selector);
      await Promise.all([
        currentPage.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: CONFIG.maxWait,
        }),
        el.click(),
      ]);
      await logPageUrl(browser, `After clicking ${label}`);
      return;
    } catch (err) {
      console.warn(
        `⚠ Failed click on ${label} (attempt ${attempt}) -> ${err.message}`
      );
      if (attempt === 3) throw err;
    }
  }
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

    let currentPage = await browser.newPage();

    // Handle unwanted popups / redirect hijacks
    browser.on("targetcreated", async (target) => {
      const newPage = await target.page();
      if (newPage) {
        const url = newPage.url();
        if (!url.includes("fzmovies")) {
          console.log("❌ Closing popup:", url);
          try {
            await newPage.close();
          } catch(e) {
            console.warn("Could not close popup, it may have already been closed.")
          }
        } else {
          console.log("🔄 Switching to new main page:", url);
          currentPage = newPage;
          await logPageUrl(browser, "Switched to new page");
        }
      }
    });

    // Handle frame detachments
    currentPage.on("framedetached", () => {
      console.warn("⚠ Frame detached! Will retry on new active page...");
    });

    const client = await currentPage.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOADS_FOLDER,
    });

    // Step 1: Go to site and search
    await currentPage.goto(site, {
      waitUntil: "networkidle2",
      timeout: CONFIG.maxWait,
    });
    await logPageUrl(browser, "Opened site");

    await currentPage.waitForSelector(CONFIG.searchBoxSelector, {
      timeout: CONFIG.maxWait,
    });
    const searchBox = await currentPage.$(CONFIG.searchBoxSelector);
    await searchBox.click({ clickCount: 3 });
    await searchBox.type(query, { delay: 80 });
    await currentPage.keyboard.press("Enter");
    await currentPage.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: CONFIG.maxWait,
    });
    await logPageUrl(browser, "After search");

    // Step 2: Click first movie result
    await safeClick(browser, CONFIG.resultsListSelector, "first search result");

    // Step 3: Click 720p download option
    await safeClick(browser, CONFIG.qualityLinkSelector, "720p option");

    // Step 4: Follow intermediate pages until final dlink.php
    while (true) {
      const pageNow = await getActivePage(browser);
      await logPageUrl(browser, "Intermediate step");

      await pageNow.waitForFunction(
        () => {
          return (
            document.querySelector('a[href*="dlink.php"]') ||
            document.querySelector('a[onclick*="window.location.href"]')
          );
        },
        { timeout: CONFIG.maxWait }
      );

      const finalLink = await pageNow.$('a[href*="dlink.php"]');
      if (finalLink) {
        // This is a direct download link, no navigation expected
        await finalLink.click();
        await logPageUrl(browser, "After clicking final dlink.php");
        break;
      }

      const intermediateLink = await pageNow.$(
        'a[onclick*="window.location.href"]'
      );
      if (intermediateLink) {
        await Promise.all([
          pageNow.waitForNavigation({
            waitUntil: "networkidle2",
            timeout: CONFIG.maxWait,
          }),
          intermediateLink.click(),
        ]);
        await logPageUrl(browser, "After intermediate link");
      } else {
        throw new Error(
          "Cannot find final download link or next intermediate link."
        );
      }
    }

    console.log(
      `⬇️ Download triggered for ${path.basename(
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

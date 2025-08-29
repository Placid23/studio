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

// Helper: Safe click with retry + debug logs
async function safeClick(page, selector, label = selector) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`➡ Waiting for ${label} (attempt ${attempt})`);
      await page.waitForSelector(selector, { timeout: CONFIG.maxWait });
      const el = await page.$(selector);
      console.log(`✅ Found ${label}, clicking...`);
      await Promise.all([
        page.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: CONFIG.maxWait,
        }),
        el.click(),
      ]);
      console.log(`➡ Navigation complete after clicking ${label}, URL: ${page.url()}`);
      return;
    } catch (err) {
      console.warn(
        `⚠ Failed click on ${label} (attempt ${attempt})... ${err.message}`
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
          currentPage = newPage; // switch context
        }
      }
    });

    // Handle frame detachments
    currentPage.on("framedetached", () => {
      console.warn("⚠ Frame detached! Retrying on new active page...");
    });

    const client = await currentPage.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOADS_FOLDER,
    });

    // Step 1: Go to site and search
    console.log(`➡ Navigating to site: ${site}`);
    await currentPage.goto(site, {
      waitUntil: "networkidle2",
      timeout: CONFIG.maxWait,
    });
    console.log(`✅ Arrived at ${currentPage.url()}`);

    await currentPage.waitForSelector(CONFIG.searchBoxSelector, {
      timeout: CONFIG.maxWait,
    });
    const searchBox = await currentPage.$(CONFIG.searchBoxSelector);
    await searchBox.click({ clickCount: 3 });
    await searchBox.type(query, { delay: 80 });
    console.log(`🔍 Searching for "${query}"...`);
    await currentPage.keyboard.press("Enter");
    await currentPage.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: CONFIG.maxWait,
    });
    console.log(`✅ Search results page loaded: ${currentPage.url()}`);

    // Step 2: Click first movie result
    await safeClick(currentPage, CONFIG.resultsListSelector, "first search result");

    // Step 3: Click 720p download option
    await safeClick(currentPage, CONFIG.qualityLinkSelector, "720p quality option");

    // Step 4: Follow intermediate pages until final dlink.php
    while (true) {
      console.log("➡ Looking for final or intermediate download link...");
      await currentPage.waitForFunction(
        () => {
          return (
            document.querySelector('a[href*="dlink.php"]') ||
            document.querySelector('a[onclick*="window.location.href"]')
          );
        },
        { timeout: CONFIG.maxWait }
      );

      const finalLink = await currentPage.$('a[href*="dlink.php"]');
      if (finalLink) {
        console.log("✅ Found final dlink.php link, clicking...");
        await finalLink.click();
        break;
      }

      const intermediateLink = await currentPage.$(
        'a[onclick*="window.location.href"]'
      );
      if (intermediateLink) {
        console.log("➡ Found intermediate redirect link, clicking...");
        await safeClick(currentPage, 'a[onclick*="window.location.href"]', "intermediate link");
      } else {
        throw new Error(
          "❌ Cannot find final download link or next intermediate link."
        );
      }
    }

    console.log(
      `⬇ Download triggered for ${path.basename(
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

    console.log(`🎬 Starting search for "${query}"...`);
    await downloadMovie(site, query, out);
    console.log(`🎉 Successfully downloaded "${query}" to ${out}`);
  } catch (err) {
    console.error("❌ Error:", err.message || err);
    process.exit(1);
  }
})();

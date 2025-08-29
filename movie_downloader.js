
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
  maxWait: 30000
};

const DOWNLOADS_FOLDER = path.resolve(process.cwd(), 'downloads');

// Ensure downloads folder exists
if (!fs.existsSync(DOWNLOADS_FOLDER)) {
  fs.mkdirSync(DOWNLOADS_FOLDER, { recursive: true });
}


// Helper: Wait until a file exists and is fully downloaded
function waitForDownload(fileName, folder) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
        clearInterval(interval);
        reject(new Error(`Download timed out for ${fileName} after ${CONFIG.maxWait / 1000} seconds.`));
    }, CONFIG.maxWait * 2); // Give double the max wait time for download completion

    const interval = setInterval(() => {
      try {
        const files = fs.readdirSync(folder);
        const targetFile = files.find(f => f === fileName && !f.endsWith('.crdownload'));
        if (targetFile) {
          clearInterval(interval);
          clearTimeout(timeout);
          resolve(path.join(folder, targetFile));
        }
      } catch (e) {
        // Ignore errors if folder doesn't exist yet, etc.
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

    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOADS_FOLDER,
    });

    // Step 1: Go to site and search
    await page.goto(site, {
      waitUntil: "domcontentloaded",
      timeout: CONFIG.maxWait,
    });

    await page.waitForSelector(CONFIG.searchBoxSelector, {
      timeout: CONFIG.maxWait,
    });
    const searchBox = await page.$(CONFIG.searchBoxSelector);
    await searchBox.click({ clickCount: 3 });
    await searchBox.type(query, { delay: 80 });
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: CONFIG.maxWait });

    // Step 2: Click first movie result
    await page.waitForSelector(CONFIG.resultsListSelector, { timeout: CONFIG.maxWait });
    const searchResults = await page.$$(CONFIG.resultsListSelector);
    if (!searchResults.length) throw new Error("No search results found.");

    await searchResults[0].click();
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: CONFIG.maxWait });

    // Step 3: Click 720p download option
    await page.waitForSelector(CONFIG.qualityLinkSelector, { timeout: CONFIG.maxWait });
    await page.click(CONFIG.qualityLinkSelector);
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: CONFIG.maxWait });

    // Step 4: Follow intermediate pages until final dlink.php
    while (true) {
      // Wait for either the final download link or the next intermediate link
      await page.waitForFunction(() => {
        return (
          document.querySelector('a[href*="dlink.php"]') ||
          document.querySelector('a[onclick*="window.location.href"]')
        );
      }, { timeout: CONFIG.maxWait });

      // Check if the final download link is on the page
      const finalLink = await page.$('a[href*="dlink.php"]');
      if (finalLink) {
        await finalLink.click();
        break; // Download has been triggered
      }

      // If not, find the next intermediate link and click it
      const intermediateLink = await page.$('a[onclick*="window.location.href"]');
      if (intermediateLink) {
        await intermediateLink.click();
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: CONFIG.maxWait });
      } else {
        throw new Error("Cannot find final download link or next intermediate link.");
      }
    }

    console.log(
      `Download triggered for ${path.basename(outPath)}. Waiting for file to complete...`
    );

    const fileName = path.basename(outPath);
    const downloadedFilePath = await waitForDownload(fileName, DOWNLOADS_FOLDER);

    console.log("Download completed:", downloadedFilePath);

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

    console.log(`Searching for "${query}"...`);
    await downloadMovie(site, query, out);
    console.log(`Successfully downloaded "${query}" to ${out}`);
  } catch (err) {
    console.error("Error:", err.message || err);
    process.exit(1);
  }
})();

/**
 * movie_downloader.js
 *
 * Automates downloading movies from fzmovies.live using Puppeteer
 *
 * Usage:
 *   node movie_downloader.js --site "https://fzmovies.live" --query "Fast and Furious 5" --out "ff5.mkv" --headless false
 */

import fs from "fs";
import path from "path";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

// CLI arguments
const argv = yargs(hideBin(process.argv))
  .option("site", { type: "string", demandOption: true })
  .option("query", { type: "string", demandOption: true })
  .option("out", { type: "string", demandOption: true })
  .option("headless", { type: "boolean", default: false })
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
        reject(new Error(`Download timed out after ${CONFIG.maxWait / 1000} seconds.`));
    }, CONFIG.maxWait * 2); // Give double the max wait time for download completion

    const interval = setInterval(() => {
      const files = fs.readdirSync(folder);
      // Look for file without .crdownload extension
      if (files.some(f => f === fileName && !f.endsWith('.crdownload'))) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 1000);
  });
}

// Main download function
async function downloadMovie(site, query, outPath) {
  let browser = null;
  try {
    const executablePath = await chromium.executablePath || process.env.CHROME_PATH;

    if (!executablePath) {
        throw new Error("Could not find a Chrome or Chromium executable. Please set CHROME_PATH environment variable for local development.");
    }

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: argv.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: DOWNLOADS_FOLDER
    });

    // Step 1: Go to site and search
    await page.goto(site, { waitUntil: "domcontentloaded", timeout: CONFIG.maxWait });
    await page.waitForSelector(CONFIG.searchBoxSelector, { timeout: CONFIG.maxWait });
    const searchBox = await page.$(CONFIG.searchBoxSelector);
    await searchBox.click({ clickCount: 3 });
    await searchBox.type(query, { delay: 80 });
    await page.keyboard.press("Enter");

    // Step 2: Click first movie result
    await page.waitForSelector(CONFIG.resultsListSelector, { timeout: CONFIG.maxWait });
    const searchResults = await page.$$(CONFIG.resultsListSelector);
    if (!searchResults.length) throw new Error("No search results found.");
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: CONFIG.maxWait }),
      searchResults[0].click(),
    ]);

    // Step 3: Click 720p download option
    await page.waitForSelector(CONFIG.qualityLinkSelector, { timeout: CONFIG.maxWait });
    const qualityLink = await page.$(CONFIG.qualityLinkSelector);

    const onclickAttr = await page.evaluate(el => el.getAttribute('onclick'), qualityLink);
    let nextPageUrl;
    if (onclickAttr && onclickAttr.includes('window.location.href')) {
      const match = onclickAttr.match(/window\.location\.href=["']([^"']+)["']/);
      if (match) nextPageUrl = new URL(match[1], page.url()).href;
    } else {
      nextPageUrl = await page.evaluate(el => el.href, qualityLink);
    }

    // Step 4: Follow intermediate pages until final dlink.php
    while (true) {
      await page.goto(nextPageUrl, { waitUntil: "domcontentloaded", timeout: CONFIG.maxWait });

      // Wait for either final or next intermediate link
      await page.waitForFunction(() => {
        return document.querySelector('a[href*="dlink.php"]') ||
               document.querySelector('a[onclick*="window.location.href"]');
      }, { timeout: CONFIG.maxWait });

      const finalLink = await page.$('a[href*="dlink.php"]');
      if (finalLink) {
        await finalLink.click();
        break; // download triggered
      }

      const intermediateLink = await page.$('a[onclick*="window.location.href"]');
      if (!intermediateLink) throw new Error("Cannot find final download link or next intermediate link");

      nextPageUrl = await page.evaluate(el => {
        const onclick = el.getAttribute('onclick');
        const match = onclick.match(/window\.location\.href=["']([^"']+)["']/);
        return new URL(match[1], window.location.href).href;
      }, intermediateLink);
    }

    console.log(`Download triggered for ${path.basename(outPath)}. Waiting for file to complete...`);

    const fileName = path.basename(outPath);
    await waitForDownload(fileName, DOWNLOADS_FOLDER);

    console.log("Download completed:", path.join(DOWNLOADS_FOLDER, fileName));

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

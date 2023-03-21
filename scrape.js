import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import { sendMessage as sendTelegramMessage } from "./telegram.js";
import { writeToLog } from "./logger.js";

export async function run() {
  if (await isInStock()) {
    writeToLog("YES!!!");
    sendTelegramMessage(process.env.IN_STOCK_MESSAGE);
  } else {
    writeToLog("No");
  }
}

async function isInStock() {
  const { browser, page } = await openConnection();
  try {
    if (!fs.existsSync(generateFolderPath())) {
      fs.mkdirSync(generateFolderPath(), { recursive: true });
    }
  } catch (err) {
    console.log(err);
  }

  await page.screenshot({
    path: `${generateFolderPath()}/${generateStringForFileName()}.webp`,
    type: "webp",
    quality: 10,
    clip: { height: 250, width: 600, x: 250, y: 250 },
  });

  const inStock = await _isInStock(page);

  await browser.close();

  return inStock;
}

function generateStringForFileName() {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "long",
    hour12: false,
  })
    .format(new Date())
    .replace(/\//g, "_")
    .replace(/:/g, "_")
    .replace(",", "--")
    .replace(" ", "")
    .replace(" ", "-");
}

function generateFolderPath() {
  const today = new Date();
  return `${new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(
    today
  )}/${new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    today
  )}/${new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(today)}`;
}

async function openConnection() {
  const browser = await puppeteer.use(StealthPlugin()).launch({
    headless: true,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();

  await page.goto(process.env.URL);

  // Set screen size
  await page.setViewport({ width: 1080, height: 1024 });

  await page.waitForSelector(".logo-headline-wrap");
  return { browser, page };
}

async function _isInStock(page) {
  const allButtons = await page.$$(".btn-price-wrap > *");

  let buyButton;

  // finds "buy" button
  for (const btn of allButtons) {
    const text = await page.evaluate((el) => el.textContent, btn);
    if (text.trim() === "buy") {
      buyButton = btn;
    }
  }

  if (!buyButton) {
    return false;
  }

  const buyButtonDisplayProperty = await page.evaluate(
    (el) => window.getComputedStyle(el).getPropertyValue("display"),
    buyButton
  );

  if (buyButtonDisplayProperty === "none") {
    return false;
  } else {
    return true;
  }
}

/*
Author: Christian Hänsel
Contact: chris@chaensel.de
Description: Gets the CSS classes used above the fold throughout your website, using all URLs referenced in the sitemap you provide.
Date: 11.06.2023
*/

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const Sitemapper = require('sitemapper');
const fs = require('fs');



// Get the command-line arguments
let sitemapUrl, userAgent, viewportHeight, viewportWidth;

// Getting the named arguments
process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split('=');

  if (key === 'sitemapUrl') {
    sitemapUrl = value;
  } else if (key === 'userAgent') {
    userAgent = value;
  } else if (key === 'viewportHeight') {
    viewportHeight = parseInt(value, 10);
  } else if (key === 'viewportWidth') {
    viewportWidth = parseInt(value, 10);
  }
});

// Use default values if arguments are not provided
if (!sitemapUrl) {
  console.error('Error: sitemapUrl is missing'); // You really need to pass a sitemap URL
  process.exit(1); // We exit. Seriously, we need the sitemap URL...
}

if (!userAgent) {
  userAgent = 'My-User-Agent'; // The default user agent string to be used when none is given
}

if (!viewportHeight) {
  viewportHeight = 1000; // The default viewportHeight to use when none is given
}

if (!viewportWidth) {
  viewportWidth = 1000; // The default viewportWidth to use when none is given
}

// Validate the command-line arguments
if (!sitemapUrl) {
  console.error('Please provide a sitemap URL as the first argument.');
  process.exit(1);
}

// get the URLs from the sitemap. If it's a sitemap index file,
// it will get the URLs from all sitemaps referenced in the sitemap index.
async function getUrlsFromSitemap(sitemapUrl, userAgent) {
  const sitemap = new Sitemapper({ requestHeaders: { 'User-Agent': userAgent } });
  try {
    const sites = await sitemap.fetch(sitemapUrl);
    return sites.sites;
  } catch (error) {
    throw error;
  }
}

async function scrapeClasses(urls) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setUserAgent(userAgent);

  const allClasses = []; // Array to store all the used classes
  console.log("Starting up with UserAgent " + userAgent + ", ViewportHeight: " + viewportHeight + " ViewportWidth: " + viewportWidth + "...");
  for (const url of urls) {
    await page.setViewport({ width: viewportWidth, height: viewportHeight }); // Set your desired viewport size

    console.log("Loading URL: " + url);
    await page.goto(url, { waitUntil: 'networkidle0' }); // Load the page and wait until it's fully loaded

    // Evaluate the JavaScript code in the page context to collect CSS classes
    const classes = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')); // Select all elements on the page

      // Filter out the elements that are above the fold
      const aboveFoldElements = elements.filter(element => {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });

      // Collect the CSS classes from the above-fold elements
      const classesSet = new Set();
      aboveFoldElements.forEach(element => {
        const elementClasses = Array.from(element.classList);
        elementClasses.forEach(className => {
          classesSet.add(className);
        });
      });

      return Array.from(classesSet);
    });

    // Add unique classes to the allClasses array
    classes.forEach(className => {
      if (!allClasses.includes(className)) {
        allClasses.push(className);
      }
    });
  }

  await browser.close();

  return allClasses;
}

// Call the function to fetch and process the sitemap
(async () => {
  try {
    const urls = await getUrlsFromSitemap(sitemapUrl, userAgent);
    const uniqueUrls = [...new Set(urls)];
    const allClasses = await scrapeClasses(uniqueUrls);
    console.log('All Classes:', allClasses);

    // Sort the classes alphabetically
    allClasses.sort();

    // Convert allClasses array to CSV format with each class on a separate line
    const csvContent = allClasses.join('\n');
    const url = new URL(sitemapUrl);
    const domain = url.hostname;
    const csvFileName = `${domain}-CSS-ATF.csv`;


    // Write CSV content to a file
    fs.writeFile(csvFileName, csvContent, 'utf8', (err) => {
      if (err) {
        console.error('Error writing CSV file:', err);
      } else {
        console.log('CSV file saved successfully!');
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
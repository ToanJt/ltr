const https = require("https");

const SITEMAP_URL = "https://ltrvisuals.com/sitemap.xml";
const SEARCH_ENGINES = [
  `https://www.google.com/ping?sitemap=${SITEMAP_URL}`,
  `https://www.bing.com/ping?sitemap=${SITEMAP_URL}`,
];

async function pingSearchEngines() {
  for (const engine of SEARCH_ENGINES) {
    try {
      await new Promise((resolve, reject) => {
        https
          .get(engine, (res) => {
            console.log(`Pinged ${engine} - Status: ${res.statusCode}`);
            resolve();
          })
          .on("error", (err) => {
            console.error(`Error pinging ${engine}:`, err);
            reject(err);
          });
      });
    } catch (error) {
      console.error("Failed to ping search engine:", error);
    }
  }
}

pingSearchEngines();

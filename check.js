const fs = require("node:fs");
const path = require("node:path");
const { pages, root, siteUrl, absoluteUrl } = require("./build.js");

const failures = [];
const expectedOutputs = new Set(["index.html", ...pages.map((page) => page.output)]);
const expectedPageUrls = pages.map((page) => absoluteUrl(page.output));

function fail(message) {
  failures.push(message);
}

function checkFile(file, label) {
  if (!fs.existsSync(file)) fail("missing " + label + ": " + path.relative(root, file));
}

function localTarget(file, link) {
  const cleanLink = link.split(/[?#]/, 1)[0];
  return path.resolve(path.dirname(file), cleanLink);
}

for (const page of pages) {
  const source = path.join(root, page.source);
  const output = path.join(root, page.output);
  checkFile(source, "source");
  checkFile(output, "generated page");
  if (!fs.existsSync(output)) continue;

  const html = fs.readFileSync(output, "utf8");
  for (const required of ["<!doctype html>", "<main", "data-theme-toggle", "data-menu-toggle", "assets/css/style.css", "assets/js/theme.js", "assets/js/site.js"]) {
    if (!html.toLowerCase().includes(required.toLowerCase())) fail(path.relative(root, output) + ": missing " + required);
  }

  const canonicalMatches = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?/gi)];
  if (canonicalMatches.length !== 1) fail(path.relative(root, output) + ": expected exactly one canonical link");
  else if (canonicalMatches[0][1] !== absoluteUrl(page.output)) fail(path.relative(root, output) + ": canonical URL is incorrect");

  const hreflangLinks = new Map([...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"\s*\/?/gi)].map((match) => [match[1], match[2]]));
  const alternatePage = pages.find((candidate) => candidate.output === page.alternateOutput);
  const xDefaultPage = pages.find((candidate) => candidate.output === page.xDefaultOutput);
  const expectedHreflang = new Map([[page.lang, absoluteUrl(page.output)], [alternatePage.lang, absoluteUrl(alternatePage.output)], ["x-default", absoluteUrl(xDefaultPage.output)]]);
  for (const [lang, url] of expectedHreflang) {
    if (hreflangLinks.get(lang) !== url) fail(path.relative(root, output) + ": hreflang " + lang + " is missing or incorrect");
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const link = match[1];
    if (/^(?:[a-z]+:|#)/i.test(link) || link.startsWith("//")) continue;
    if (!fs.existsSync(localTarget(output, link))) fail(path.relative(root, output) + " -> missing " + link);
  }
}

const rootIndex = path.join(root, "index.html");
checkFile(rootIndex, "root redirect");
if (fs.existsSync(rootIndex)) {
  const html = fs.readFileSync(rootIndex, "utf8");
  if (!html.includes("url=en/index.html")) fail("index.html: redirect target is not en/index.html");
  if (!html.includes(absoluteUrl("en/index.html"))) fail("index.html: canonical URL is incorrect");
}

const sitemapFile = path.join(root, "sitemap.xml");
checkFile(sitemapFile, "sitemap");
if (fs.existsSync(sitemapFile)) {
  const sitemap = fs.readFileSync(sitemapFile, "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  if (sitemapUrls.length !== expectedPageUrls.length || sitemapUrls.some((url, index) => url !== expectedPageUrls[index])) {
    fail("sitemap.xml: URLs do not match the generated pages");
  }
}

const robotsFile = path.join(root, "robots.txt");
checkFile(robotsFile, "robots.txt");
if (fs.existsSync(robotsFile)) {
  const robots = fs.readFileSync(robotsFile, "utf8");
  if (!robots.includes("User-agent: *")) fail("robots.txt: missing User-agent rule");
  if (!robots.includes("Allow: /")) fail("robots.txt: missing Allow rule");
  if (!robots.includes("Sitemap: " + siteUrl + "/sitemap.xml")) fail("robots.txt: sitemap URL is missing or incorrect");
}

for (const directory of ["en", "ja"]) {
  const dir = path.join(root, directory);
  if (!fs.existsSync(dir)) continue;
  for (const entry of fs.readdirSync(dir)) {
    if (!entry.endsWith(".html")) continue;
    const relative = path.join(directory, entry).split(path.sep).join("/");
    if (!expectedOutputs.has(relative)) fail("stale generated page: " + relative);
  }
}

for (const page of pages) {
  const source = path.join(root, page.source);
  if (!fs.existsSync(source)) continue;
  const content = fs.readFileSync(source, "utf8");
  if (!content.trim().startsWith("<main")) fail(path.relative(root, source) + ": source must start with <main");
}

if (failures.length) {
  console.error("Checks failed:");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}

console.log("All source, generated-page, link, asset, canonical, hreflang, sitemap, robots, and stale-file checks passed.");

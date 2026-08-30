const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const siteUrl = 'https://gabriel-55.github.io';
const template = fs.readFileSync(path.join(root, 'src', 'templates', 'layout.html'), 'utf8');
const pages = [
  { source: 'src/pages/en/index.page.html', output: 'en/index.html', alternateOutput: 'ja/index.html', xDefaultOutput: 'en/index.html', lang: 'en', title: 'Shun Yat Choy', description: 'Research and software portfolio of Shun Yat Choy.', name: 'Shun Yat Choy (Shinichi)', current: 'home', languageHref: '../ja/index.html', languageLabel: '日本語', homeHref: '#top', assetRoot: '../' },
  { source: 'src/pages/en/background.page.html', output: 'en/background.html', alternateOutput: 'ja/background.html', xDefaultOutput: 'en/background.html', lang: 'en', title: 'Background — Shun Yat Choy', description: 'A summary of Shun Yat Choy\'s education, work experience, languages, and achievements.', name: 'Shun Yat Choy (Shinichi)', current: 'background', languageHref: '../ja/background.html', languageLabel: '日本語', homeHref: 'index.html', assetRoot: '../' },
  { source: 'src/pages/en/projects.page.html', output: 'en/projects.html', alternateOutput: 'ja/projects.html', xDefaultOutput: 'en/projects.html', lang: 'en', title: 'Research & Projects — Shun Yat Choy', description: 'An introduction to current research and software projects.', name: 'Shun Yat Choy (Shinichi)', current: 'projects', languageHref: '../ja/projects.html', languageLabel: '日本語', homeHref: 'index.html', assetRoot: '../' },
  { source: 'src/pages/ja/index.page.html', output: 'ja/index.html', alternateOutput: 'en/index.html', xDefaultOutput: 'en/index.html', lang: 'ja', title: '蔡 信一', description: '蔡 信一の研究・ソフトウェアポートフォリオ。', name: '蔡 信一', current: 'home', languageHref: '../en/index.html', languageLabel: 'English', homeHref: '#top', assetRoot: '../' },
  { source: 'src/pages/ja/background.page.html', output: 'ja/background.html', alternateOutput: 'en/background.html', xDefaultOutput: 'en/background.html', lang: 'ja', title: '経歴 — 蔡 信一', description: '蔡 信一の経歴・受賞歴。', name: '蔡 信一', current: 'background', languageHref: '../en/background.html', languageLabel: 'English', homeHref: 'index.html', assetRoot: '../' },
  { source: 'src/pages/ja/projects.page.html', output: 'ja/projects.html', alternateOutput: 'en/projects.html', xDefaultOutput: 'en/projects.html', lang: 'ja', title: '研究・作品 — 蔡 信一', description: '蔡 信一の研究活動とソフトウェア作品。', name: '蔡 信一', current: 'projects', languageHref: '../en/projects.html', languageLabel: 'English', homeHref: 'index.html', assetRoot: '../' },
];
const navLabels = {
  en: { aria: 'Main navigation', home: 'Home', background: 'Background', projects: 'Research &amp; Projects' },
  ja: { aria: 'メインナビゲーション', home: 'ホーム', background: '経歴', projects: '研究・作品' },
};
function absoluteUrl(output) {
  return siteUrl + '/' + output;
}
function languageLinks(page) {
  const alternateLang = page.lang === 'en' ? 'ja' : 'en';
  return [
    '<link rel="alternate" hreflang="' + page.lang + '" href="' + absoluteUrl(page.output) + '" />',
    '<link rel="alternate" hreflang="' + alternateLang + '" href="' + absoluteUrl(page.alternateOutput) + '" />',
    '<link rel="alternate" hreflang="x-default" href="' + absoluteUrl(page.xDefaultOutput) + '" />',
  ].join('\n    ');
}
function navLink(href, label, current) {
  const currentAttribute = current ? ' aria-current="page"' : '';
  return '<a href="' + href + '"' + currentAttribute + '>' + label + '</a>';
}
function render(page) {
  const labels = navLabels[page.lang];
  const navigation = [
    navLink(page.homeHref, labels.home, page.current === 'home'),
    navLink('background.html', labels.background, page.current === 'background'),
    navLink('projects.html', labels.projects, page.current === 'projects'),
    '<a class="language-switch" href="' + page.languageHref + '">' + page.languageLabel + '</a>',
  ].join('\n        ');
  const content = fs.readFileSync(path.join(root, page.source), 'utf8').trim();
  const html = template
    .replaceAll('{{lang}}', page.lang)
    .replaceAll('{{title}}', page.title)
    .replaceAll('{{description}}', page.description)
    .replaceAll('{{canonical}}', absoluteUrl(page.output))
    .replaceAll('{{language-links}}', languageLinks(page))
    .replaceAll('{{name}}', page.name)
    .replaceAll('{{asset-root}}', page.assetRoot)
    .replace('{{nav-aria}}', labels.aria)
    .replace('{{home-href}}', page.homeHref)
    .replace('{{navigation}}', navigation)
    .replace('{{content}}', content);
  const output = path.join(root, page.output);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html.trim() + '\n');
}
function buildSitemap() {
  const entries = pages.map((page) => '  <url>\n    <loc>' + absoluteUrl(page.output) + '</loc>\n  </url>');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n'));
}
function buildRobots() {
  fs.writeFileSync(path.join(root, 'robots.txt'), [
    'User-agent: *',
    'Allow: /',
    '',
    'Sitemap: ' + siteUrl + '/sitemap.xml',
    '',
  ].join('\n'));
}
function buildSite() {
  for (const page of pages) render(page);

  fs.writeFileSync(path.join(root, 'index.html'), [
    '<!doctype html>',
    '<html lang="en">',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '    <meta http-equiv="refresh" content="0; url=en/index.html" />',
    '    <link rel="canonical" href="' + absoluteUrl('en/index.html') + '" />',
    '    <title>Shun Yat Choy</title>',
    '  </head>',
    '  <body>',
    '    <p>Redirecting to the <a href="en/index.html">English site</a>.</p>',
    '  </body>',
    '</html>',
    '',
  ].join('\n'));
  buildSitemap();
  buildRobots();
  console.log('Built ' + pages.length + ' pages, sitemap.xml, and robots.txt.');
}

module.exports = { pages, root, siteUrl, absoluteUrl, buildSite };

if (require.main === module) buildSite();

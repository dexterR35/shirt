import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
// These sources use regex groups, without named path parameters.
const destination = pathname => config.rewrites.find(rule => new RegExp(`^${rule.source}$`).test(pathname))?.destination;

test('Vercel serves the app for direct Studio and Catalog navigation, including trailing slashes', () => {
  for (const pathname of ['/', '/studio', '/studio/', '/catalog', '/catalog/', '/catalog/romania', '/catalog/romania/', '/catalog/england/premier-league', '/catalog/england/premier-league/']) {
    assert.equal(destination(pathname), '/index.html', pathname);
  }
});

test('Vercel keeps catalog JSON and static assets out of the HTML fallback, including missing files', () => {
  for (const pathname of ['/catalog/manifest.json', '/catalog/competitions.json', '/catalog/teams/team_missing.json', '/catalog/kits/team_missing-home-r001.json', '/assets/base/preview-missing.webp', '/assets/missing.js', '/fonts/missing.woff2', '/reviews/missing.json']) {
    assert.equal(destination(pathname), undefined, pathname);
  }
});

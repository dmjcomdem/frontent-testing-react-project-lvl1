import path from 'path';
import { promises as fs } from 'fs';

import getResource from '../src/getResource';

/* variables */
const url = 'https://ru.hexlet.io/courses';

/* utils */
const getFixture = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFixture = (filename) => fs.readFile(getFixture(filename), 'utf-8');

describe('getResource', () => {
  test('should return html data and links', async () => {
    const indexHTML = await readFixture('index.html');
    const expectedHTML = await readFixture('ru-hexlet-io-courses.html');
    const expectedLinks = [
      {
        href: 'https://ru.hexlet.io/assets/professions/nodejs.png',
        name: 'ru-hexlet-io-assets-professions-nodejs.png',
      },
      {
        href: 'https://ru.hexlet.io/assets/application.css',
        name: 'ru-hexlet-io-assets-application.css',
      },
      {
        href: 'https://ru.hexlet.io/courses',
        name: 'ru-hexlet-io-courses.html',
      },
      {
        href: 'https://ru.hexlet.io/packs/js/runtime.js',
        name: 'ru-hexlet-io-packs-js-runtime.js',
      },
    ];

    const result = await getResource(indexHTML, url);

    expect(result).toMatchObject({
      html: expectedHTML,
      links: expectedLinks,
    });
  });

  test('should return default html structure and empty html-response', async () => {
    const result = await getResource('', url);

    expect(result).toMatchObject({
      html: '<html><head></head><body></body></html>',
      links: [],
    });
  });

  test('should return error for empty url', async () => {
    const indexHTML = await readFixture('index.html');

    const result = async () => getResource(indexHTML);
    await expect(result).rejects.toThrowError(/Invalid URL/);
  });

  test('should return error for nullable html-data', async () => {
    const result = async () => getResource(null, url);
    await expect(result).rejects.toThrowError('cheerio.load() expects a string');
  });
});

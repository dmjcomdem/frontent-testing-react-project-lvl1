import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

/* npm-package */
import nock from 'nock';
import axios from 'axios';

/* file loader */
import loader from '../src';

/* settings */
axios.defaults.adapter = require('axios/lib/adapters/http');

/* variables */
const origin = 'https://ru.hexlet.io';
const pathname = '/courses';
const url = `${origin}${pathname}`;
const expectedHTML = 'ru-hexlet-io-courses.html';
const resourceFiles = 'ru-hexlet-io-courses_files';
let tempDir = '';

/* resources-data */
const resources = [
  {
    path: '/assets/application.css',
    name: 'ru-hexlet-io-assets-application.css',
    contentType: 'text/css',
  },
  {
    path: '/assets/professions/nodejs.png',
    name: 'ru-hexlet-io-assets-professions-nodejs.png',
    contentType: 'image/png',
  },
  {
    path: '/packs/js/runtime.js',
    name: 'ru-hexlet-io-packs-js-runtime.js',
    contentType: 'text/javascript',
  },
];

/* utils */
const readFile = (filePath) => fs.readFile(filePath, 'utf-8');
const getFixture = (filename) => path.join(__dirname, '../__fixtures__', filename);

describe('page-loader', () => {
  afterAll(() => {
    nock.restore();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-folder'));
    const indexFile = getFixture('index.html');
    nock(origin).persist().get(pathname).replyWithFile(200, indexFile, {
      'Content-Type': 'text/plain',
    });

    // fetch fixture resource data
    for (const resource of resources) {
      const data = getFixture(resource.name);
      nock(origin).persist().get(resource.path).replyWithFile(200, data, {
        'Content-Type': resource.contentType,
      });
    }
  });

  test('should returns absolute path to the saved file', async () => {
    const resultPath = await loader(url, tempDir);

    const result = await readFile(resultPath);
    const expected = await readFile(getFixture(expectedHTML));

    await expect(fs.access(resultPath)).resolves.toBe(undefined);
    expect(path.isAbsolute(resultPath)).toBeTruthy();
    expect(result).toBe(expected);
  });

  test.each(resources.map((resource) => [resource.name]))('should return %s', async (name) => {
    await loader(url, tempDir);
    const result = await readFile(`${tempDir}/${resourceFiles}/${name}`);
    const expected = await readFile(getFixture(name));

    expect(result).toBe(expected);
  });

  test.each([
    [400, '/not-found'],
    [500, '/'],
  ])('should return reject with %s', async (responseCode, url) => {
    const scope = nock(origin).get(url).reply(responseCode);
    const result = () => loader(`${origin}${url}`, tempDir);
    await expect(result).rejects.toThrow(Error);
    scope.isDone();
  });

  test('should return error for wrong folder', async () => {
    await expect(loader(origin, `${tempDir}/folder`)).rejects.toThrow();
  });
});

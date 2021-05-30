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
const htmlFileName = 'ru-hexlet-io-courses.html';
const filesFolder = 'ru-hexlet-io-courses_files';
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
const getFixture = (fileName) => path.join(__dirname, '../__fixtures__', fileName);

describe('page-loader', () => {
  afterAll(() => {
    nock.restore();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  beforeAll(async () => {
    // create temp-directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-folder'));
  });

  beforeEach(async () => {
    const indexFile = await readFile(getFixture('index.html'));
    nock(origin).get(pathname).reply(200, indexFile);

    // fetch fixture resource data
    for (const resource of resources) {
      const data = getFixture(resource.name);
      nock(origin).get(resource.path).replyWithFile(200, data, {
        'Content-Type': resource.contentType,
      });
    }
  });

  test('should return expected html', async () => {
    const resultPath = await loader(url, tempDir);
    const result = await readFile(resultPath);
    const expected = await readFile(getFixture(htmlFileName));

    expect(result).toBe(expected);
  });

  test.each(resources.map((resource) => [resource.name]))('should return %s', async (name) => {
    const result = await readFile(`${tempDir}/${filesFolder}/${name}`);
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

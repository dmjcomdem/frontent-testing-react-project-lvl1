import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

/* npm-package */
import nock from 'nock';
import axios from 'axios';
import axiosHttpAdapter from 'axios/lib/adapters/http';

/* file loader */
import loader from '../src/index';

/* settings */
nock.disableNetConnect();
axios.defaults.adapter = axiosHttpAdapter;

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
  },
  {
    path: '/assets/professions/nodejs.png',
    name: 'ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    path: '/packs/js/runtime.js',
    name: 'ru-hexlet-io-packs-js-runtime.js',
  },
];

/* utils */
const getFixture = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filePath) => fs.readFile(filePath, 'utf-8');
const readFixture = (filename) => fs.readFile(getFixture(filename), 'utf-8');

describe('page-loader', () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('page loaded and saved with resources', async () => {
    const indexFile = await readFixture('index.html');
    let scope = nock(origin).get(pathname).times(2).reply(200, indexFile);

    // fetch fixture resource data
    for (const resource of resources) {
      const data = await readFixture(resource.name);
      scope.get(resource.path).reply(200, data);
    }

    await loader(url, tempDir);
    const actualHtml = await readFile(`${tempDir}/${expectedHTML}`);
    const expectedHtml = await readFile(getFixture(expectedHTML));
    expect(actualHtml).toBe(expectedHtml);

    for (const { name } of resources) {
      const result = await readFile(`${tempDir}/${resourceFiles}/${name}`);
      const expected = await readFile(getFixture(name));
      expect(result).toBe(expected);
    }
    scope.isDone();
  });

  test('throw error if page not exist', async () => {
    const scope = nock(origin).persist().get(pathname).reply(500);
    const result = () => loader(url, tempDir);
    await expect(result).rejects.toThrow(Error);
    scope.isDone();
  });

  test('throw error if output dit not exist', async () => {
    await expect(loader(url, 'notExistedDir')).rejects.toThrowError();
  });
});

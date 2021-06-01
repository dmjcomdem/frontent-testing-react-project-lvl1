import os from 'os';
import path from 'path';
import { promises as fs } from 'fs';

/* npm-package */
import nock from 'nock';
import axios from 'axios';

/* file loader */
import loader from '../src';

/* settings */
nock.disableNetConnect();
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
const getFixture = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filePath) => fs.readFile(filePath, 'utf-8');

describe('page-loader', () => {
  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    // const indexFile = await readFile(getFixture('index.html'));

    let beforeHtml = await readFile(getFixture('index.html'));
    let imgFile = await readFile(getFixture('ru-hexlet-io-assets-professions-nodejs.png'));
    let scriptFile = await readFile(getFixture('ru-hexlet-io-packs-js-runtime.js'));
    let cssFile = await readFile(getFixture('ru-hexlet-io-assets-application.css'));

    // for (const resource of resources) {
    //   const data =  await readFile(getFixture(resource.name));
    //   nock(origin).persist().get(resource.path).replyWithFile(200, data, {
    //     'Content-Type': resource.contentType,
    //   });
    // }

    nock('https://ru.hexlet.io')
      .get('/courses')
      .times(2)
      .reply(200, beforeHtml)
      .get('/assets/professions/nodejs.png')
      .reply(200, imgFile)
      .get('/packs/js/runtime.js')
      .reply(200, scriptFile)
      .get('/assets/application.css')
      .reply(200, cssFile);
  });

  test('should returns absolute path to the saved file', async () => {
    const resultPath = await loader(url, tempDir);
    await expect(fs.access(resultPath)).resolves.toBe(undefined);
    expect(path.isAbsolute(resultPath)).toBeTruthy();
  });

  test('should expected result file', async () => {
    const resultPath = await loader(url, tempDir);
    const result = await readFile(resultPath);
    let expectedHtml = await readFile(getFixture('ru-hexlet-io-courses.html'));
    expect(result).toBe(expectedHtml);
  });

  test.each(resources.map((resource) => [resource.name]))('should return %s', async (name) => {
    await loader(url, tempDir);
    const result = await readFile(`${tempDir}/${resourceFiles}/${name}`);
    const expected = await readFile(getFixture(name));
    expect(result).toBe(expected);
  });

  test('should return reject with 400', async () => {
    const scope = nock(origin).get('/not-found').reply(400);
    const result = () => loader(`${origin}/not-found`, tempDir);
    await expect(result).rejects.toThrow(Error);
    scope.isDone();
  });

  test('should return reject with 500', async () => {
    const scope = nock(origin).get('/').reply(500);
    const result = () => loader(`${origin}/`, tempDir);
    await expect(result).rejects.toThrow(Error);
    scope.isDone();
  });

  test('should return error for wrong folder', async () => {
    await expect(loader(origin, `${tempDir}/folder`)).rejects.toThrow();
  });
});

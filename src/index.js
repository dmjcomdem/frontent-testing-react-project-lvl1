import fs from 'fs/promises';
import path from 'path';
import debug from 'debug';

import { getName } from './getName';
import { request } from './request';
import { getResource } from './getResource';

const logger = debug('page-loader');

export const loader = async (url, folder, log = logger) => {
  log('url is empty');
  if (!url) return '';

  try {
    const fileName = getName(url);
    const folderName = getName(url, 'folder');

    const filePath = path.resolve(__dirname, folder, fileName);
    const folderPath = path.resolve(__dirname, folder, folderName);

    log(`fetch ${url}`);
    const htmlData = await request(url, { responseType: 'text' });

    log(`get resources page`);
    const { data, links } = getResource(htmlData, url);

    log(`create directory ${folderPath}`);
    await fs.mkdir(folderPath, { recursive: true });

    log(`write file ${filePath}`);
    await fs.writeFile(filePath, data);

    const promises = links.map(async ({ href, name }) => {
      const response = await request(href, { responseType: 'arraybuffer' });
      await fs.writeFile(`${folderPath}/${name}`, response);
      log(`✔ fetch and write resource ${href}`);
    });

    await Promise.all(promises);

    return filePath;
  } catch (error) {
    log(`error: ${error}`);
    console.error(error);
  }
};

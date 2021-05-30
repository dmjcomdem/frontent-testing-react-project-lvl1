import fs from 'fs/promises';
import path from 'path';
import debug from 'debug';

import getName from './getName';
import request from './request';
import getResource from './getResource';

const logger = debug('page-loader');

const loader = async (url = '', folder = process.cwd()) => {
  logger(`URL argument - ${url}`);

  if (!url && typeof url !== 'string') {
    logger('url is empty');
    return '';
  }

  try {
    const fileName = getName(url);
    const folderName = getName(url, 'folder');

    const filePath = path.resolve(__dirname, String(folder), fileName);
    const folderPath = path.resolve(__dirname, String(folder), folderName);

    logger(`fetch ${url}`);
    const htmlData = await request(url);

    logger(`get resources page`);
    const { html, links } = getResource(htmlData, url);

    logger(`create directory ${folderPath}`);
    await fs.mkdir(folderPath, { recursive: true });

    logger(`write file ${filePath}`);
    await fs.writeFile(filePath, html);

    for await (let { href, name } of links) {
      logger(`✔ start fetch resource [${name}] - ${href}`);
      const response = await request(href, { responseType: 'arraybuffer' });
      await fs.writeFile(`${folderPath}/${name}`, response);
      logger(`✔ fetch and write resource ${href}`);
    }

    return filePath;
  } catch (error) {
    logger(`error: ${error}`);
    throw error;
  }
};

export default loader;

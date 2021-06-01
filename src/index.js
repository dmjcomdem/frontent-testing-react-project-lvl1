import { promises as fs } from 'fs';
import path from 'path';
import debug from 'debug';

import getName from './getName';
import request from './request';
import getResource from './getResource';

const logger = debug('page-loader');

const loader = async (url, folder = process.cwd()) => {
  try {
    logger(`URL argument - ${url}`);

    if (!url && typeof url !== 'string') {
      logger('URL is empty');
      return 'URL is empty';
    }

    await fs.access(folder);

    const fileName = getName(url);
    const folderName = getName(url, 'folder');

    const filePath = path.resolve(folder, fileName);
    const folderPath = path.resolve(folder, folderName);

    logger(`fetch ${url}`);
    const htmlData = await request(url);

    logger(`get resources page`);
    const { html, links } = getResource(htmlData, url);

    await fs.mkdir(folderPath);
    logger(`create directory ${folderPath}`);

    await fs.writeFile(filePath, html);
    logger(`write file ${filePath}`);

    if (links.length) {
      for await (let { href, name } of links) {
        logger(`✔ start fetch resource [${name}] - ${href}`);
        const response = await request(href, { responseType: 'arraybuffer' });
        await fs.writeFile(`${folderPath}/${name}`, response);
        logger(`✔ fetch and write resource ${href}`);
      }
    }
  } catch (error) {
    logger(`error: ${error}`);
    throw new Error(error);
  }
};

export default loader;

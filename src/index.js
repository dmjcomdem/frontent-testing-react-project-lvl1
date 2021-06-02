import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';

import debug from 'debug';
import 'axios-debug-log';

import getName from './getName';
import getResource from './getResource';

const logger = debug('page-loader');
const greenCheckChar = chalk.green('\u2705 ');

const loader = async (url, folder = process.cwd()) => {
  try {
    logger(`URL argument - ${url}`);

    if (!url && typeof url !== 'string') {
      logger('URL is empty');
      return Promise.reject(new Error('URL is empty'));
    }

    await fs.access(folder);

    const fileName = getName(url);
    const folderName = getName(url, 'folder');

    const filePath = path.resolve(folder, fileName);
    const folderPath = path.resolve(folder, folderName);

    logger(`fetch ${url}`);
    const { data: htmlData } = await axios(url);

    logger('get resources page');
    const { html, links } = getResource(htmlData, url);

    await fs.mkdir(folderPath);
    logger(`create directory ${folderPath}`);

    await fs.writeFile(filePath, html);
    logger(`write file ${filePath}`);

    if (links.length) {
      // eslint-disable-next-line no-restricted-syntax
      for await (const { href, name } of links) {
        const { data: response } = await axios(href, { responseType: 'arraybuffer' });
        await fs.writeFile(`${folderPath}/${name}`, response);
        console.log(`${greenCheckChar} ${href}`);
        logger(`${href} was successfully loaded`);
      }
    }

    return true;
  } catch (error) {
    logger(`error: ${error}`);
    console.error(error.message);
    throw error;
  }
};

export default loader;

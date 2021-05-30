import fs from 'fs/promises';
import path from 'path';
import debug from 'debug';
import axios from 'axios';

import getName from './getName';
import getResource from './getResource';

const logger = debug('page-loader');

const loader = async (url, folder = process.cwd()) => {
  if (!url) {
    logger('url is empty');
    return '';
  }

  try {
    const fileName = getName(url);
    const folderName = getName(url, 'folder');

    const filePath = path.resolve(__dirname, folder, fileName);
    const folderPath = path.resolve(__dirname, folder, folderName);

    logger(`fetch ${url}`);
    const { data: htmlData } = await axios(url, { responseType: 'text' });

    logger(`get resources page`);
    const { html, links } = getResource(htmlData, url);

    logger(`create directory ${folderPath}`);
    await fs.mkdir(folderPath, { recursive: true });

    logger(`write file ${filePath}`);
    await fs.writeFile(filePath, html);

    for await (const { href, name } of links) {
      const { data: response } = await axios(href, { responseType: 'arraybuffer' });
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

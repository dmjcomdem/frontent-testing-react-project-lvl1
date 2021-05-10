import fs from 'fs/promises';
import path from 'path';

import { getName } from './getName';
import { request } from './request';
import { getResource } from './getResource';

export const loader = async (url, folder) => {
  if (!url) return '';

  const fileName = getName(url);
  const folderName = getName(url, 'folder');
  const filePath = path.resolve(__dirname, folder, fileName);
  const folderPath = path.resolve(__dirname, folder, folderName);

  const htmlData = await request(url, { responseType: 'text' });
  const { data, links } = getResource(htmlData, url);

  await fs.mkdir(folderPath);
  await fs.writeFile(filePath, data);

  const promises = links.map(async ({ href, name }) => {
    const response = await request(href, { responseType: 'arraybuffer' });
    await fs.writeFile(`${folderPath}/${name}`, response);
  });

  await Promise.all(promises);

  return filePath;
};

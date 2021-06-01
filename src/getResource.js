import cheerio from 'cheerio';
import chalk from 'chalk';

import getName from './getName';

const tagsMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const isLocalURL = (url, origin) => {
  if (url === undefined) {
    return false;
  }
  return new URL(origin).origin === new URL(url, origin).origin;
};

const getResource = (data, url) => {
  const links = [];
  const $ = cheerio.load(data);
  const folder = getName(url, 'folder');

  Object.entries(tagsMap).forEach(([tag, attr]) => {
    $(tag).each((_, el) => {
      const value = $(el).attr(attr);
      if (!value) return;

      if (!isLocalURL(value, url)) {
        return;
      }

      const href = new URL(value, url).toString();
      const name = getName(href);
      console.log(`file name: ${chalk.cyan.bold(name)}`);
      const path = `${folder}/${name}`;

      $(el).attr(attr, path);
      links.push({ href, name });
    });
  });

  return { html: $.html(), links };
};

export default getResource;

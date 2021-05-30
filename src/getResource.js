import cheerio from 'cheerio';
import getName from './getName';
import debug from 'debug';

const logger = debug('page-loader');

const tagsMap = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export const getResource = (data, url) => {
  const links = [];
  const $ = cheerio.load(data);
  const { host, origin } = new URL(url);
  const folder = getName(url, 'folder');

  Object.entries(tagsMap).forEach(([tag, attr]) => {
    $(tag).each((_, el) => {
      const value = $(el).attr(attr);
      if (!value) return;

      const link = new URL(value, origin);

      if (link.host !== host) {
        return;
      }

      const href = link.toString();
      const name = getName(href);
      const path = `${folder}/${name}`;

      $(el).attr(attr, path);
      links.push({ href, name });
    });
  });

  return { html: $.html(), links };
};

export default getResource;

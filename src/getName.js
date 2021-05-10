import path from 'path';

export const getName = (url, type = 'file') => {
  if (!url) return '';

  const { host, pathname } = new URL(url);
  const urlPath = `${host}${pathname}`;
  const extname = path.extname(urlPath) || '.html';
  const fileName = urlPath.replace(/[\W]/gi, '-');
  const postfix = type === 'file' ? extname : '_files';

  return `${fileName}${postfix}`;
};

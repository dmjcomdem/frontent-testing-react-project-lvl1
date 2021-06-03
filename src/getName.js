import path from 'path';

const getName = (url = '', type = 'file') => {
  const { host, pathname } = new URL(url);
  const urlPath = `${host}${pathname}`;
  const extname = path.extname(pathname) || '.html';
  const fileName = urlPath
    .replace(extname, '')
    .replace(/(?=\/$)\W/g, '')
    .replace(/\W+/g, '-');
  const postfix = type === 'file' ? extname : '_files';

  return `${fileName}${postfix}`;
};

export default getName;

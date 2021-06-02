import getName from '../src/getName';

describe('getName', () => {
  const origin = 'https://page-loader.io';
  const pathname = 'courses';
  const baseURL = `${origin}/${pathname}`;

  test('should return html file name', () => {
    const nameFile = getName(origin);
    expect(nameFile).toBe('page-loader-io.html');
  });

  test('should return file name without query-params', () => {
    const nameFile = getName(`${origin}?ver=123&name=test`);
    expect(nameFile).toBe('page-loader-io.html');
  });

  test.each([
    ['style.css', 'page-loader-io-courses-style.css'],
    ['image.png', 'page-loader-io-courses-image.png'],
    ['script.js', 'page-loader-io-courses-script.js'],
  ])('should return %s file name', (file, expected) => {
    const url = `${baseURL}/${file}`;
    const nameFile = getName(url);
    expect(nameFile).toBe(expected);
  });

  test('should return folder name', () => {
    const nameFile = getName(origin, 'folder');
    expect(nameFile).toBe('page-loader-io_files');
  });

  describe('With invalid arguments...', () => {
    const errorMessage = 'Error parse URL on getName method';

    it('should error return empty file', () => {
      const result = () => getName('');
      expect(result).toThrow(errorMessage);
    });

    it('should return empty folder', () => {
      const result = () => getName('', 'folder');
      expect(result).toThrow(errorMessage);
    });

    it('should return empty folder for no arguments', () => {
      const result = () => getName();
      expect(result).toThrow(errorMessage);
    });
  });
});

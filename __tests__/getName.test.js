// import getName from '../src/getName';
//
// describe('getName', () => {
//   const origin = 'https://page-loader.io';
//   const pathname = '/courses';
//
//   test('should return html file name', () => {
//     const nameFile = getName(origin);
//     expect(nameFile).toBe('page-loader-io.html');
//   });
//
//   test('should return css file name', () => {
//     const url = `${origin}${pathname}/style.css`;
//     const nameFile = getName(url);
//     expect(nameFile).toBe('page-loader-io-courses-style.css');
//   });
//
//   test('should return img file name', () => {
//     const url = `${origin}${pathname}/image.png`;
//     const nameFile = getName(url);
//     expect(nameFile).toBe('page-loader-io-courses-image.png');
//   });
//
//   test('should return js file name', () => {
//     const url = `${origin}${pathname}/script.js`;
//     const nameFile = getName(url);
//     expect(nameFile).toBe('page-loader-io-courses-script.js');
//   });
//
//   test('should return folder name', () => {
//     const nameFile = getName(origin, 'folder');
//     expect(nameFile).toBe('page-loader-io_files');
//   });
//
//   it('should return empty file', () => {
//     const result = getName('');
//     expect(result).toBe('');
//   });
//
//   it('should return empty folder', () => {
//     const result = getName('', 'folder');
//     expect(result).toBe('');
//   });
//
//   it('should return empty folder for no arguments', () => {
//     const result = getName();
//     expect(result).toBe('');
//   });
// });

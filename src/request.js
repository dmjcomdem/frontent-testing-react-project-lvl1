import axios from 'axios';
import 'axios-debug-log';

export const request = async (url, options) => {
  const { data } = await axios(url, options);
  return data;
};

export default request;

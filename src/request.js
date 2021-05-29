import axios from 'axios';

export const request = async (url, options) => {
  const { data } = await axios(url, options);
  return data;
};

import axios from 'axios';

export const request = async (options) => {
  const { data } = await axios(options);
  return data;
};

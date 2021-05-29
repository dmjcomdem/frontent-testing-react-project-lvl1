import axios from 'axios';

export const request = (url, options) => axios(url, options).then((response) => response?.data);

import axios from 'axios';

const request = (url, options) => axios(url, options).then((response) => response?.data);

export default request;

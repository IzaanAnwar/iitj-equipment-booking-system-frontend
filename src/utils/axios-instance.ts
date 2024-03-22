import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: 'https://crdsi-backend.vercel.app/',
  withCredentials: true,
});

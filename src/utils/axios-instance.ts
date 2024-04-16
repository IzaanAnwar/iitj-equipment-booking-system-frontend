import axios from 'axios';
import Cookies from 'js-cookie';

const apiEndpoint = process.env.API_ENDPOINT || 'http://localhost:8000/api/';
export const api = axios.create({
  baseURL: apiEndpoint,
});
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

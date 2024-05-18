import axios from 'axios';
import Cookies from 'js-cookie';

const apiEndpoint = 'http://crdsibookingportal.iitj.ac.in:8000/api';
// const apiEndpoint = 'http://localhost:8000/api';
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

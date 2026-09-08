import axios from 'axios';

export const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

axios.defaults.baseURL = apiUrl;

export const mediaUrl = (url) => {
  if (!url || url === '#' || /^https?:\/\//i.test(url)) return url;
  return `${apiUrl}${url}`;
};
import { config } from '@/config';
import axios from 'axios';

const baseURL = config.deployedUrl;

import { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL
});

export default axiosInstance;

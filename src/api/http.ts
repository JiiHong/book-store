import axios, { AxiosRequestConfig } from 'axios';
import { getToken, removeToken } from '../store/authStore';

const BASE_URL = 'http://localhost:9999';
const DEFAULT_TIMEOUT = 30000;

export const createClient = (config?: AxiosRequestConfig) => {
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'content-type': 'application/json',
      Authorization: getToken() ? getToken() : '',
    },
    withCredentials: true,
    ...config,
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // 로그인 만료 처리
      if (error.response.status === 401) {
        removeToken();
        window.location.href = '/login';
        return;
      }
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

export const httpClient = createClient();

// 공통 요청 부분

type RequestMethod = 'get' | 'post' | 'put' | 'delete';

export const requestHandler = async <R = undefined, T = undefined>(
  method: RequestMethod,
  url: string,
  payload?: T,
) => {
  let response;

  switch (method) {
    case 'post':
      response = await httpClient.post<R>(url, payload);
      break;
    case 'get':
      response = await httpClient.get<R>(url);
      break;
    case 'put':
      response = await httpClient.put<R>(url, payload);
      break;
    case 'delete':
      response = await httpClient.delete<R>(url);
      break;
  }

  return response.data;
};

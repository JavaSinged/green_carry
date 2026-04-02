import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKSERVER}`, // 백엔드 주소
});

// 🌟 요청 인터셉터: 서버로 보내기 직전에 실행
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;

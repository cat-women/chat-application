import axios from "axios";

export const BaseAxios = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.BASE_URL : import.meta.env.VITE_BASE_URL,
});

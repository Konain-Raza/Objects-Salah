import axios from "axios";

const API_BASE_URL = "https://objects-prayers.vercel.app/api/"; // Replace with your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export default api;

import axios from "axios";

export const BASE_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace("/api", "");

export const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});
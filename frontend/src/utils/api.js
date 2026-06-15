import axios from 'axios'

// In dev, Vite's proxy forwards /api → localhost:8000 (see vite.config.js)
// In prod, Vercel's rewrite proxy is unreliable — call Render directly instead
export const BASE = import.meta.env.DEV
  ? ''
  : 'https://second-life-commerce-backend-ffpa.onrender.com'

export default axios.create({ baseURL: BASE })

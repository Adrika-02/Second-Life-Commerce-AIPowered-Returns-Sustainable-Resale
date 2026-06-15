import axios from 'axios'

// In dev, Vite's proxy forwards /api and /static → localhost:8000 (see vite.config.js)
// In prod, Vercel has no proxy — call Render directly for both API and media files
export const BASE = import.meta.env.DEV
  ? ''
  : 'https://second-life-commerce-backend-ffpa.onrender.com'

// Converts a relative /static/... path to an absolute URL pointing at the backend.
// Absolute URLs (S3, Unsplash, etc.) are returned unchanged.
export const mediaUrl = (path) => {
  if (!path) return path
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${BASE}${path}`
}

export default axios.create({ baseURL: BASE })

import axios from "axios";

// Adds ngrok-skip-browser-warning to every request.
// This tells ngrok's free tier to skip its HTML warning gate
// and forward requests straight to the backend.
const api = axios.create({
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

export default api;

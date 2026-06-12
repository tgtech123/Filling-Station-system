import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://fueldesk-station-server.onrender.com";

let _socket = null;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/**
 * Connect (or return existing connection).
 * Safe to call multiple times — returns the same socket instance.
 */
export function getSocket() {
  // Return the existing instance whether connected OR still connecting —
  // checking `.connected` here made a second caller during the handshake
  // window spawn a duplicate zombie connection.
  if (_socket) return _socket;

  const token = getToken();
  if (!token) return null;

  _socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000,
  });

  _socket.on("connect_error", (err) => {
    console.warn("[Socket] connection error:", err.message);
  });

  return _socket;
}

export function disconnectSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}

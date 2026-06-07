import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (onMessageReceived) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const wsUrl = baseApiUrl.replace(/^http/, 'ws') + `/ws?token=${token}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onMessageReceived) {
          onMessageReceived(payload);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [onMessageReceived]);

  return { isConnected };
};

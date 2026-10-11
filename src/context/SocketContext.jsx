import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

function socketBaseUrl() {
  return (
    (import.meta.env.VITE_SOCKET_URL || '').trim() ||
    `${window.location.protocol}//${window.location.hostname}:5000`
  );
}

/**
 * Always connect (guests included) so booking slots stay live.
 * Admins also join the admins room when authenticated.
 */
export function SocketProvider({ children }) {
  const { token, isAdmin } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(socketBaseUrl(), {
      auth: token ? { token } : {},
      transports: ['websocket', 'polling'],
    });

    const onConnect = () => {
      s.emit('join:booking');
      if (isAdmin) s.emit('join:admins');
    };

    s.on('connect', onConnect);
    setSocket(s);

    return () => {
      s.off('connect', onConnect);
      s.disconnect();
      setSocket(null);
    };
  }, [token, isAdmin]);

  const value = useMemo(() => ({ socket }), [socket]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext)?.socket || null;
}

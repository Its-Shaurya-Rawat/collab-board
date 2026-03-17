import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    socketRef.current = io('http://localhost:5000');
    const socket = socketRef.current;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-board', { userId: user.id, userName: user.name, boardId: 'main' });
    });

    socket.on('active-users', (users) => setActiveUsers(users));
    socket.on('disconnect', () => setConnected(false));

    return () => socket.disconnect();
  }, [user]);

  const emit = (event, data) => socketRef.current?.emit(event, data);
  const on = (event, cb) => { socketRef.current?.on(event, cb); return () => socketRef.current?.off(event, cb); };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, emit, on, activeUsers, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { RealtimeNotification, PickupRequest, PlatformAnalytics } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  reconnect: () => void;
  notifications: RealtimeNotification[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  unreadCount: number;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const connectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }

    setIsConnecting(true);
    setConnectionError(null);

    const newSocket = io(window.location.origin, {
      auth: { token: token || undefined },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      setIsConnecting(false);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated on the server, reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (err) => {
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError('Real-time connection failed. Retrying...');
    });

    // Listen for new notifications
    newSocket.on('notification:new', (notif: RealtimeNotification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
    });

    // Global listener for pickup creation and updates to trigger notifications if relevant
    newSocket.on('request:created', (pickup: PickupRequest) => {
      if (user?.role === 'staff' || user?.role === 'agency') {
        const notif: RealtimeNotification = {
          id: `notif-${Date.now()}`,
          title: 'New Pickup Request',
          message: `Request #${pickup.trackingCode} placed for ${pickup.categories.join(', ')} (${pickup.citizenName})`,
          type: 'info',
          timestamp: new Date().toISOString(),
          requestId: pickup.id,
        };
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((c) => c + 1);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?.role]);

  useEffect(() => {
    const cleanup = connectSocket();
    return () => {
      if (cleanup) cleanup();
    };
  }, [connectSocket]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isConnecting,
        connectionError,
        reconnect: connectSocket,
        notifications,
        dismissNotification,
        clearAllNotifications,
        unreadCount,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

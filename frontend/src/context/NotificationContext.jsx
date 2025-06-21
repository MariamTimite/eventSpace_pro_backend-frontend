import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from '../components/common/NotificationToast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      message,
      type,
      duration
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    addNotification(message, 'success', duration);
  }, [addNotification]);

  const showError = useCallback((message, duration) => {
    addNotification(message, 'error', duration);
  }, [addNotification]);

  const showWarning = useCallback((message, duration) => {
    addNotification(message, 'warning', duration);
  }, [addNotification]);

  const showInfo = useCallback((message, duration) => {
    addNotification(message, 'info', duration);
  }, [addNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}; 
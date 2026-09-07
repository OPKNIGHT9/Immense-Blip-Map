import React, { useEffect, useState, useRef } from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';
import './Notification.css';

export interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface NotificationProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<{ notification: NotificationData; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    const duration = notification.duration ?? 3000;
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 300);

    const removeTimer = setTimeout(() => {
      onDismissRef.current(notification.id);
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [notification.id, notification.duration]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Check size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'info':
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div className={`notification notification-${notification.type} ${isExiting ? 'notification-exit' : ''}`}>
      <div className="notification-icon">
        {getIcon()}
      </div>
      <span className="notification-message">{notification.message}</span>
    </div>
  );
};

const Notification: React.FC<NotificationProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export default Notification;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (message: string, type: NotificationData['type'] = 'success', duration: number = 3000) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const notify = {
    success: (message: string, duration?: number) => addNotification(message, 'success', duration),
    error: (message: string, duration?: number) => addNotification(message, 'error', duration),
    info: (message: string, duration?: number) => addNotification(message, 'info', duration),
  };

  return { notifications, notify, dismissNotification };
};

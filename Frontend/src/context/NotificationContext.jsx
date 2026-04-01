import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const notify = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {notification.show && (
        <div className={`global-toast-container ${notification.show ? 'show' : ''}`}>
            <div className={`global-toast ${notification.type}`}>
               <div className="toast-content">
                  <span className="toast-icon">{notification.type === 'success' ? '✅' : '⚠️'}</span>
                  <div className="toast-text">
                     <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>
                        {notification.type === 'success' ? 'Success!' : 'Notification'}
                     </strong>
                     <span style={{ fontSize: '13px', opacity: 0.9 }}>{notification.message}</span>
                  </div>
               </div>
            </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

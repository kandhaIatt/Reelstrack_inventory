import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  ArrowLeft,
  Search,
  Bell,
  Check,
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/services';

export default function Topbar({ onToggleMenu }) {
  const navigate = useNavigate();
  const location = useLocation();

  const { openSheet, closeSheet } = useApp();
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  const isAuthenticated = !!user;

  const isDetailView = ['/reel/', '/po/', '/unit/'].some((path) =>
    location.pathname.includes(path)
  );

  // =========================================================
  // LOAD UNREAD COUNT
  // =========================================================

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const loadUnreadCount = async () => {
      try {
        const response =
          await notificationsApi.getUnreadCount();

        if (!cancelled) {
          setUnreadCount(
            Number(response.data?.count || 0)
          );
        }
      } catch (error) {
        if (!cancelled) {
          setUnreadCount(0);
        }

        console.error(
          'Failed to load notification count:',
          error
        );
      }
    };

    loadUnreadCount();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      const q = query.trim().toUpperCase();

      if (q.startsWith('R-')) {
        navigate(`/reel/${q}`);
      } else if (q.startsWith('PO-')) {
        navigate(`/po/${q}`);
      } else {
        navigate(
          `/reels?q=${encodeURIComponent(query)}`
        );
      }

      setQuery('');
    }
  };

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  const loadNotifications = async () => {
    if (!isAuthenticated) {
      return [];
    }

    setNotificationsLoading(true);

    try {
      const response =
        await notificationsApi.getAll();

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setNotifications(data);

      return data;
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error
      );

      setNotifications([]);

      return [];
    } finally {
      setNotificationsLoading(false);
    }
  };

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (createdAt) => {
    if (!createdAt) {
      return '';
    }

    const date = new Date(createdAt);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();

    const diffMs =
      now.getTime() - date.getTime();

    const diffMinutes =
      Math.floor(diffMs / 60000);

    if (diffMinutes < 1) {
      return 'Just now';
    }

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    }

    const diffHours =
      Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
      return `${diffHours} hour${
        diffHours === 1 ? '' : 's'
      } ago`;
    }

    const diffDays =
      Math.floor(diffHours / 24);

    if (diffDays < 7) {
      return `${diffDays} day${
        diffDays === 1 ? '' : 's'
      } ago`;
    }

    return date.toLocaleDateString('en-IN');
  };

  // =========================================================
  // NAVIGATE TO NOTIFICATION RECORD
  // =========================================================

  const openNotificationRecord = (notification) => {
    if (!notification) {
      return;
    }

    const entityType = String(
      notification.entityType || ''
    ).toUpperCase();

    const entityId = notification.entityId;

    if (!entityId) {
      return;
    }

    if (entityType === 'REEL') {
      navigate(`/reel/${entityId}`);
      return;
    }

    if (
      entityType === 'PO' ||
      entityType === 'PURCHASE_ORDER'
    ) {
      navigate(`/po/${entityId}`);
      return;
    }

    if (
      entityType === 'JOB' ||
      entityType === 'CUTTING_JOB'
    ) {
      navigate(`/jobs/${entityId}`);
      return;
    }

    if (entityType === 'TRANSFER') {
      navigate(`/transfers/${entityId}`);
      return;
    }

    if (entityType === 'UNIT') {
      navigate(`/unit/${entityId}`);
      return;
    }

    // USER notifications
    if (entityType === 'USER') {
      navigate(`/users/${entityId}`);
      return;
    }
  };

  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification) {
      return;
    }

    try {
      if (!notification.read) {
        await notificationsApi.markAsRead(
          notification.id
        );

        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read: true,
                }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }
    } catch (error) {
      console.error(
        'Failed to mark notification as read:',
        error
      );
    }

    openNotificationRecord(notification);

    // Close notification sheet after opening record
    closeSheet();
  };

  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  const handleMarkAllAsRead = async () => {
    if (!unreadCount) {
      return;
    }

    try {
      await notificationsApi.markAllAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        'Failed to mark all notifications as read:',
        error
      );
    }
  };

  // =========================================================
  // SHOW NOTIFICATION SHEET
  // =========================================================

  const showNotifications = async () => {
    const latestNotifications =
      await loadNotifications();

    openSheet(
      'Notifications',
      <NotificationContent
        notifications={latestNotifications}
        loading={notificationsLoading}
        unreadCount={unreadCount}
        onNotificationClick={
          handleNotificationClick
        }
        onMarkAllAsRead={
          handleMarkAllAsRead
        }
        formatTime={formatTime}
      />,
      <button
        className="btn btn-ghost btn-block"
        onClick={closeSheet}
        type="button"
      >
        Close
      </button>
    );
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <header className="topbar">
      <button
        className="hbtn menu-btn"
        onClick={onToggleMenu}
        aria-label="Open menu"
      >
        <Menu size={19} />
      </button>

      {isDetailView && (
        <button
          className="hbtn"
          onClick={() => navigate(-1)}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
      )}

      <div className="crumb">
        <span
          className="link"
          onClick={() =>
            navigate('/dashboard')
          }
        >
          ReelTrack
        </span>

        <span className="sep">/</span>

        <b>
          {location.pathname === '/dashboard'
            ? 'Dashboard'
            : location.pathname
                .substring(1)
                .toUpperCase()}
        </b>
      </div>

      <div className="tb-spacer" />

      <div className="gsearch">
        <span className="gi">
          <Search size={16} />
        </span>

        <input
          type="search"
          placeholder="Search reel, job or PO…"
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
          onKeyDown={handleSearch}
        />

        <kbd>/</kbd>
      </div>

      <button
        className="hbtn notification-btn"
        onClick={showNotifications}
        aria-label="Notifications"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="notification-count">
            {unreadCount > 99
              ? '99+'
              : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}

// =========================================================
// NOTIFICATION CONTENT
// =========================================================

function NotificationContent({
  notifications,
  loading,
  unreadCount,
  onNotificationClick,
  onMarkAllAsRead,
  formatTime,
}) {
  if (loading) {
    return (
      <div className="listcard">
        <div
          className="card-pad"
          style={{
            boxShadow: 'none',
            textAlign: 'center',
            padding: '30px 20px',
          }}
        >
          <div className="muted">
            Loading notifications...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="listcard">
      {/* HEADER */}
      <div
        className="card-pad"
        style={{
          boxShadow: 'none',
          paddingBottom: 10,
        }}
      >
        <div
          className="between"
          style={{
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              Notifications
            </div>

            <div
              className="tiny muted"
              style={{
                marginTop: 2,
              }}
            >
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You're all caught up"}
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={onMarkAllAsRead}
              type="button"
            >
              <Check size={14} />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* EMPTY */}
      {!notifications.length ? (
        <div
          className="card-pad"
          style={{
            boxShadow: 'none',
            textAlign: 'center',
            padding: '30px 20px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 650,
            }}
          >
            No notifications
          </div>

          <div
            className="tiny muted"
            style={{
              marginTop: 5,
            }}
          >
            New alerts will appear here.
          </div>
        </div>
      ) : (
        /* NOTIFICATION LIST */
        notifications.map((notification) => (
          <button
            key={notification.id}
            type="button"
            onClick={() =>
              onNotificationClick(
                notification
              )
            }
            style={{
              width: '100%',
              border: 'none',
              borderTop:
                '1px solid var(--line)',
              background: notification.read
                ? 'transparent'
                : 'var(--surface-2)',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
              }}
            >
              {/* UNREAD DOT */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  minWidth: 8,
                  borderRadius: '50%',
                  marginTop: 6,
                  background:
                    notification.read
                      ? 'transparent'
                      : 'var(--primary)',
                }}
              />

              <div
                style={{
                  flex: 1,
                }}
              >
                {/* TITLE */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight:
                      notification.read
                        ? 550
                        : 700,
                  }}
                >
                  {notification.title}
                </div>

                {/* MESSAGE */}
                {notification.message && (
                  <div
                    className="tiny muted"
                    style={{
                      marginTop: 4,
                      lineHeight: 1.45,
                    }}
                  >
                    {notification.message}
                  </div>
                )}

                {/* TIME */}
                <div
                  className="tiny muted"
                  style={{
                    marginTop: 5,
                  }}
                >
                  {formatTime(
                    notification.createdAt
                  )}
                </div>
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
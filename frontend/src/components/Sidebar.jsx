import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  LayoutDashboard,
  Disc,
  Scissors,
  FileText,
  Factory,
  ArrowRightLeft,
  BarChart3,
  Truck,
  Building,
  Layers,
  Users,
  Settings,
} from 'lucide-react';

const NAV = [
  {
    group: 'Overview',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        path: '/reports',
        label: 'Reports',
        icon: BarChart3,
      },
    ],
  },

  {
    group: 'Inventory',
    items: [
      {
        path: '/reels',
        label: 'Reel Inventory',
        icon: Disc,
      },
      {
        path: '/jobs',
        label: 'Cutting Jobs',
        icon: Scissors,
      },
      {
        path: '/units',
        label: 'Units',
        icon: Factory,
      },
      {
        path: '/transfers',
        label: 'Transfers',
        icon: ArrowRightLeft,
      },
    ],
  },

  {
    group: 'Procurement',
    items: [
      {
        path: '/pos',
        label: 'Purchase Orders',
        icon: FileText,
      },
      {
        path: '/po-reports',
        label: 'PO Reports',
        icon: BarChart3,
      },
      {
        path: '/suppliers',
        label: 'Suppliers',
        icon: Truck,
      },
      {
        path: '/mills',
        label: 'Mills',
        icon: Building,
      },
    ],
  },

  {
    group: 'Configuration',
    items: [
      {
        path: '/reel-types',
        label: 'Reel Types',
        icon: Layers,
      },
      {
        path: '/users',
        label: 'Users & Roles',
        icon: Users,
        adminOnly: true,
      },
      {
        path: '/settings',
        label: 'Settings',
        icon: Settings,
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        
        <div className="sb-brand">
          <div className="brand-mark">
            <Disc size={18} />
          </div>

          <div>
            <div className="brand-name">
              ReelTrack
            </div>

            <div className="brand-sub">
              Reel inventory &amp; POs
            </div>
          </div>
        </div>

        <nav className="sb-nav">
          {NAV.map((group, index) => {

            const visibleItems = group.items.filter(
              (item) =>
                isAdmin || !item.adminOnly
            );

            if (!visibleItems.length) return null;

            return (
              <div key={index}>

                <div className="sb-group">
                  {group.group}
                </div>

                {visibleItems.map((item) => {

                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `nav-item ${
                          isActive ? 'on' : ''
                        }`
                      }
                    >
                      <span className="ni-ico">
                        <Icon size={17} />
                      </span>

                      <span>
                        {item.label}
                      </span>
                    </NavLink>
                  );
                })}

              </div>
            );
          })}
        </nav>

        <div className="sb-foot">

          <button
            className="who"
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
          >

            <span className="av">
              {user?.name
                ? user.name
                    .split(' ')
                    .map((name) => name[0])
                    .join('')
                : 'U'}
            </span>

            <span>

              <span className="nm">
                {user?.name || 'User'}
              </span>

              <span className="rl">
                {isAdmin
                  ? 'All Units · Admin'
                  : `${user?.unitId || 'U1'} · User`}
              </span>

            </span>

            <span className="cog">
              <Settings size={15} />
            </span>

          </button>

        </div>

      </aside>

      <div
        className={`sb-scrim ${
          isOpen ? 'show' : ''
        }`}
        onClick={onClose}
      />

    </>
  );
}
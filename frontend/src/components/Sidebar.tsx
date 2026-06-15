import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const Sidebar: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    { icon: '📊', label: 'Dashboard', path: '/dashboard' },
    { icon: '💰', label: 'Wallet', path: '/wallet' },
    { icon: '👥', label: 'Groups', path: '/groups' },
    { icon: '💸', label: 'Withdraw', path: '/withdraw' },
    ...(user?.role === 'super_admin' ? [{ icon: '⚙️', label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-green-600 to-green-700 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-green-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold">
            ♻️
          </div>
          <h1 className="text-2xl font-bold">Chamaa</h1>
        </div>
        <p className="text-xs text-green-100 mt-1">Community Savings</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-white text-green-600 font-semibold'
                  : 'text-green-100 hover:bg-green-500'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-green-500 text-xs text-green-100">
        <p>© 2026 Merry Go Round</p>
        <p>All rights reserved</p>
      </div>
    </aside>
  );
};

export default Sidebar;

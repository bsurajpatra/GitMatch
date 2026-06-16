import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Users, FileText,
  Settings, LogOut, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',        to: '/',          match: ['/'] },
  { icon: User,            label: 'Single Candidate', to: '/candidate', match: ['/candidate', '/results'] },
  { icon: Users,           label: 'Bulk Screening',   to: '/bulk',      match: ['/bulk'],    primary: true },
  { icon: FileText,        label: 'Reports',          to: '/reports',   match: ['/reports'] },
];

function NavItem({ icon: Icon, label, to, match, primary, active, onClick }) {
  return (
    <button
      className={`sidebar-nav-item ${active ? 'sidebar-nav-active' : ''} ${primary ? 'sidebar-nav-primary' : ''}`}
      onClick={onClick}
      title={label}
    >
      <Icon size={16} className="sidebar-nav-icon" />
      <span className="sidebar-nav-label">{label}</span>
      {primary && <span className="sidebar-primary-dot" />}
    </button>
  );
}

export default function Sidebar({ userData, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (match) => match.some(m => location.pathname === m);

  return (
    <aside className="app-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <img src="./logo.png" alt="GitMatch" className="sidebar-logo" />
        <span className="sidebar-brand-name">
          Git<em>Match</em>
        </span>
      </div>

      {/* Main nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.to}
            {...item}
            active={isActive(item.match)}
            onClick={() => navigate(item.to)}
          />
        ))}

        <div className="sidebar-divider" />

        <NavItem
          icon={Settings}
          label="Settings"
          to="/settings"
          match={['/settings']}
          active={location.pathname === '/settings'}
          onClick={() => navigate('/settings')}
        />
      </nav>

      {/* Footer — user + logout */}
      <div className="sidebar-footer">
        {userData && (
          <div className="sidebar-user">
            <img
              src={userData.avatar_url}
              alt={userData.login}
              className="sidebar-user-avatar"
            />
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {userData.name || userData.login}
              </span>
              <span className="sidebar-user-login">@{userData.login}</span>
            </div>
          </div>
        )}
        <button className="btn-sidebar-logout" onClick={onLogout} id="btn-logout">
          <LogOut size={13} />
          Logout
        </button>
      </div>
    </aside>
  );
}

import { NavLink, Outlet } from 'react-router';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/sidebar', label: 'Sidebar' },
  { to: '/popup', label: 'Popup' },
  { to: '/float', label: 'Float' },
  { to: '/bottom', label: 'Bottom' },
  { to: '/drawer', label: 'Drawer' },
  { to: '/modal', label: 'Modal' },
  { to: '/custom-card', label: 'Custom card' },
];

export function DemoLayout() {
  return (
    <div className="demo-shell">
      <nav className="demo-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              isActive ? 'demo-nav__link demo-nav__link--active' : 'demo-nav__link'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="demo-body">
        <Outlet />
      </div>
    </div>
  );
}

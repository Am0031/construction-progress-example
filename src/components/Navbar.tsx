import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Map', to: '/' },
  { label: 'Overview', to: '/overview' },
  { label: 'Programme', to: '/programme' },
  { label: 'Resources', to: '/resources' },
  { label: 'Risks', to: '/risks' },
  { label: 'Report', to: '/report' },
  { label: 'Assistant', to: '/assistant' },
];

const Navbar = () => {
  return (
    <header className="no-print flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 text-slate-100 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600 text-sm font-bold">
          NG
        </span>
        <span className="hidden text-sm font-semibold tracking-wide md:inline">
          National Grid Upgrade
        </span>
      </div>
      <nav className="hidden items-center gap-0.5 sm:flex">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `rounded px-2.5 py-1.5 text-sm transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;

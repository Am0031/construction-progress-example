import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Map', to: '/' },
  { label: 'Programme', to: '/programme' },
  { label: 'Resources', to: '/resources' },
  { label: 'Risks', to: '/risks' },
  { label: 'Report', to: '/report' },
  { label: 'Assistant', to: '/assistant' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className='no-print relative flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 text-slate-100 sm:px-6'>
      <Link
        to='/'
        onClick={() => setMenuOpen(false)}
        className='flex items-center gap-2'
      >
        <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded bg-blue-600 text-sm font-bold'>
          NG
        </span>
        <span className='hidden text-sm font-semibold tracking-wide md:inline'>
          National Grid Upgrade
        </span>
      </Link>

      <nav className='hidden items-center gap-0.5 sm:flex'>
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

      <button
        type='button'
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        className='flex h-9 w-9 shrink-0 items-center justify-center rounded text-slate-300 hover:bg-slate-800 hover:text-white sm:hidden'
      >
        <svg
          viewBox='0 0 24 24'
          className='h-5 w-5'
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
        >
          {menuOpen ? (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 6l12 12M18 6L6 18'
            />
          ) : (
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M4 6h16M4 12h16M4 18h16'
            />
          )}
        </svg>
      </button>

      {menuOpen && (
        <nav className='absolute left-0 right-0 top-14 z-40 flex flex-col border-b border-slate-800 bg-slate-900 px-2 py-2 shadow-lg sm:hidden'>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;

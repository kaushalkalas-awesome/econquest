/** Shell: navbar + sidebar + main + mobile bottom nav */
import { NavLink } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const mobileLinks = [
  { to: '/dashboard', icon: '📊', label: 'Home' },
  { to: '/quests', icon: '🗺️', label: 'Quests' },
  { to: '/leaderboard', icon: '🏆', label: 'Rank' },
  { to: '/profile', icon: '👤', label: 'Profile' },
  { to: '/shop', icon: '🛍️', label: 'Shop' },
];

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-eq-dark md:flex-row">
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="min-h-0 flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
              {children}
            </main>
          </div>
        </div>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-slate-700 bg-eq-card py-2 md:hidden">
        {mobileLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs ${isActive ? 'text-blue-400' : 'text-slate-400'}`
            }
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

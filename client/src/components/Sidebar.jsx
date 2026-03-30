/** Desktop sidebar links */
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/quests', label: 'Quests', icon: '🗺️' },
  { to: '/simulations', label: 'Simulations', icon: '🎮' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/shop', label: 'Shop', icon: '🛍️' },
  { to: '/achievements', label: 'Achievements', icon: '🏅' },
];

export default function Sidebar() {
  return (
    <motion.aside 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden w-64 shrink-0 border-r border-white/5 bg-eq-dark/30 backdrop-blur-md md:block"
    >
      <nav className="flex flex-col gap-2 p-5 sticky top-[70px]">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-eq-primary/20 to-transparent text-white border-l-2 border-eq-primary shadow-[inset_2px_0_10px_rgba(59,130,246,0.1)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'group-hover:scale-110'}`}>{l.icon}</span>
                {l.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}

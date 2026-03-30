/** Top navigation */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 border-b border-white/5 bg-eq-darkest/60 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-eq-primary to-eq-secondary tracking-tight">
          EconQuest
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-2xl drop-shadow-md" title="Avatar">
              {user.avatar}
            </span>
            <span className="hidden text-slate-200 sm:inline bg-white/5 px-3 py-1 rounded-full border border-white/10">{user.displayName || user.display_name}</span>
            <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 drop-shadow-sm">🪙 {user.coins}</span>
            <span className="flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 drop-shadow-sm">💎 {user.gems}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </motion.header>
  );
}

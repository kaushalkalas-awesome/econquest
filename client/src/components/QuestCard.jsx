/** Quest card — used on dashboard recommendations */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const diffColors = {
  BEGINNER: 'bg-green-500/10 text-green-400 border-green-500/20',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ADVANCED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function QuestCard({ quest, compact }) {
  const p = quest.progress || {};
  const status = p.status || 'LOCKED';
  const href =
    status === 'IN_PROGRESS' || status === 'AVAILABLE'
      ? `/quests/${quest.id}/play`
      : `/quests`;

  let btn = '🔒 Locked';
  if (status === 'AVAILABLE') btn = 'Start Quest';
  if (status === 'IN_PROGRESS') btn = 'Continue';
  if (status === 'COMPLETED') btn = 'Replay';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden group ${
        status === 'LOCKED'
          ? 'glass-panel opacity-60 grayscale'
          : status === 'COMPLETED'
            ? 'glass-panel border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)] bg-amber-900/10'
            : status === 'IN_PROGRESS'
              ? 'glass-panel border-l-4 border-l-eq-primary border-t-white/10 border-r-white/10 border-b-white/10 shadow-[0_4px_20px_rgba(59,130,246,0.1)]'
              : 'glass-panel hover:border-blue-400/50 hover:shadow-[0_4px_25px_rgba(59,130,246,0.2)]'
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-0" />
      
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="text-4xl drop-shadow-md">{quest.iconEmoji || '📚'}</div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${diffColors[quest.difficulty]}`}
        >
          {quest.difficulty}
        </span>
      </div>
      <h3 className="mt-4 text-xl font-bold text-white relative z-10 group-hover:text-blue-300 transition-colors">{quest.title}</h3>
      {!compact && <p className="mt-2 text-sm text-slate-400 leading-relaxed font-light relative z-10">{quest.description}</p>}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-400 font-medium relative z-10">
        <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">⭐ {quest.xpReward} XP</span>
        <span className="rounded bg-white/10 border border-white/5 px-2 py-0.5 text-xs tracking-wider">{status.replace('_', ' ')}</span>
      </div>
      <Link
        to={href}
        className={`mt-5 block w-full rounded-xl py-3 text-center text-sm font-bold transition-all relative z-10 ${
          status === 'LOCKED' 
            ? 'bg-slate-700/50 text-slate-400 border border-slate-600/50' 
            : 'bg-gradient-to-r from-eq-primary to-eq-primaryDark text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] border border-blue-400/30'
        }`}
      >
        {btn}
      </Link>
    </motion.div>
  );
}

/** Dashboard stat tile */
import { motion } from 'framer-motion';

export default function StatsCard({ title, children, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`glass-panel rounded-2xl p-5 transition-all duration-300 shadow-lg ${className}`}
    >
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{title}</div>
      <div className="mt-1">{children}</div>
    </motion.div>
  );
}

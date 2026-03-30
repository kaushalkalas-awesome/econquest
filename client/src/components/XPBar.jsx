/** Level XP bar */
import { xpNeededForLevel } from '../utils/helpers';

export default function XPBar({ level = 1, currentXp = 0 }) {
  const need = xpNeededForLevel(level);
  const pct = Math.min(100, Math.round((currentXp / need) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>Level {level}</span>
        <span>
          {currentXp} / {need} XP
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-700">
        <div
          className="h-3 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

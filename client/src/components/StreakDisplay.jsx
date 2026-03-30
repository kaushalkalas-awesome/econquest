/** Fire + streak text */
export default function StreakDisplay({ streak }) {
  const active = streak > 0;
  return (
    <div className={`flex items-center gap-2 ${active ? 'animate-pulse-fire' : ''}`}>
      <span className="text-2xl">🔥</span>
      <div>
        <div className="text-xl font-bold text-orange-400">{active ? `${streak} Day Streak` : 'Start a streak!'}</div>
        {!active && <p className="text-xs text-slate-500">Complete an activity today</p>}
      </div>
    </div>
  );
}

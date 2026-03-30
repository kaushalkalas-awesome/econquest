/** Achievements grid */
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import AchievementCard from '../components/AchievementCard';

const TABS = ['ALL', 'LEARNING', 'STREAK', 'MASTERY', 'COLLECTION'];

export default function AchievementsPage() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/achievements');
      setList(data.achievements);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'ALL') return list;
    return list.filter((a) => a.category === tab);
  }, [list, tab]);

  const unlocked = list.filter((a) => a.unlocked).length;
  const pct = list.length ? Math.round((unlocked / list.length) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">🏅 Achievements</h1>
      <div className="mt-4">
        <div className="h-3 w-full rounded-full bg-slate-700">
          <div className="h-3 rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-400">
          {unlocked}/{list.length} Unlocked ({pct}%)
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {t === 'ALL'
              ? 'All'
              : t === 'LEARNING'
                ? '📚 Learning'
                : t === 'STREAK'
                  ? '🔥 Streak'
                  : t === 'MASTERY'
                    ? '🎯 Mastery'
                    : '📦 Collection'}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {filtered.map((a) => (
          <AchievementCard key={a.id} a={a} />
        ))}
      </div>
    </div>
  );
}

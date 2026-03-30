/** Quest map */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CATEGORY_LABELS } from '../utils/constants';

const diffStyle = {
  BEGINNER: 'bg-green-600/20 text-green-400 border border-green-600/30',
  INTERMEDIATE: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30',
  ADVANCED: 'bg-red-600/20 text-red-400 border border-red-600/30',
};

export default function QuestsPage() {
  const [quests, setQuests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/quests');
        setQuests(data.quests);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return quests;
    return quests.filter((q) => q.category === filter);
  }, [quests, filter]);

  if (loading) return <p className="text-slate-400">Loading quests…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">🗺️ Quest Map</h1>
      <p className="text-slate-400">Choose your learning adventure</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'MICROECONOMICS', 'MACROECONOMICS', 'PERSONAL_FINANCE', 'BEHAVIORAL_ECONOMICS'].map(
          (k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${
                filter === k ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              {k === 'ALL' ? 'All' : CATEGORY_LABELS[k]}
            </button>
          )
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((q) => {
          const st = q.progress?.status || 'LOCKED';
          const locked = st === 'LOCKED';
          const cardClass =
            st === 'LOCKED'
              ? 'opacity-60 grayscale'
              : st === 'COMPLETED'
                ? 'border-amber-500/60 shadow-amber-500/10'
                : st === 'IN_PROGRESS'
                  ? 'border-l-4 border-green-500'
                  : 'hover:border-blue-500/40';
          return (
            <div
              key={q.id}
              className={`rounded-xl border border-slate-700 bg-slate-800/60 p-5 transition-all ${cardClass}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-4xl">{q.iconEmoji}</span>
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs">
                  {CATEGORY_LABELS[q.category]}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">{q.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-400">{q.description}</p>
              <span className={`mt-3 inline-block rounded-full px-2 py-0.5 text-xs ${diffStyle[q.difficulty]}`}>
                {q.difficulty}
              </span>
              <div className="mt-3 text-xs text-slate-400">
                📖 {q.lessonCount} Lessons | 🎮 {q.challengeCount} Challenges
              </div>
              <div className="mt-2 text-xs text-slate-400">
                ⭐ {q.xpReward} XP | 🪙 {q.coinReward} Coins
              </div>
              {st === 'COMPLETED' && (
                <p className="mt-2 text-amber-300">⭐{'⭐'.repeat((q.progress?.stars || 1) - 1)}</p>
              )}
              {st === 'IN_PROGRESS' && q.challengeCount > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {q.progress?.challenges_completed ?? 0}/{q.challengeCount} challenges
                </p>
              )}
              {q.prerequisiteTitle && (
                <p className="mt-2 text-xs text-slate-500">Requires: {q.prerequisiteTitle}</p>
              )}
              <div className="mt-4">
                {locked ? (
                  <button
                    type="button"
                    disabled
                    title="Complete prerequisite first"
                    className="w-full cursor-not-allowed rounded-xl bg-slate-600 py-2 text-sm font-semibold text-slate-300"
                  >
                    🔒 Locked
                  </button>
                ) : st === 'AVAILABLE' ? (
                  <Link
                    to={`/quests/${q.id}/play`}
                    className="block w-full rounded-xl bg-blue-600 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Start Quest →
                  </Link>
                ) : st === 'IN_PROGRESS' ? (
                  <Link
                    to={`/quests/${q.id}/play`}
                    className="block w-full rounded-xl bg-green-600 py-2 text-center text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Continue →
                  </Link>
                ) : (
                  <Link
                    to={`/quests/${q.id}/play`}
                    className="block w-full rounded-xl border border-amber-500 py-2 text-center text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
                  >
                    Replay 🔄
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

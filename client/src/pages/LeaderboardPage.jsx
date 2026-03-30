/** Global / weekly leaderboard */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LeaderboardTable from '../components/LeaderboardTable';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('global');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const { data: d } = await api.get('/leaderboard', { params: { type: tab } });
      if (!cancel) setData(d);
    })();
    return () => {
      cancel = true;
    };
  }, [tab]);

  const rows = data?.leaderboard || [];
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
      <div className="mt-4 flex gap-2">
        {['global', 'weekly'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {rows.length >= 3 && (
        <div className="mx-auto mt-8 flex max-w-3xl items-end justify-center gap-4">
          <div className="flex w-24 flex-col items-center rounded-t-xl border border-slate-400 bg-slate-800/80 pb-3 pt-8">
            <span className="text-3xl">🥈</span>
            <span className="mt-2 text-2xl">{top3[1].avatar}</span>
            <span className="mt-1 text-center text-xs text-white">{top3[1].displayName}</span>
            <span className="text-xs text-slate-400">{top3[1].totalXp} XP</span>
          </div>
          <div className="flex w-28 flex-col items-center rounded-t-xl border-2 border-amber-400 bg-slate-800 pb-4 pt-4">
            <span className="text-4xl">🥇</span>
            <span className="mt-2 text-3xl">{top3[0].avatar}</span>
            <span className="mt-1 text-center text-sm font-semibold text-white">{top3[0].displayName}</span>
            <span className="text-xs text-amber-300">{top3[0].totalXp} XP</span>
          </div>
          <div className="flex w-24 flex-col items-center rounded-t-xl border border-amber-800 bg-slate-800/80 pb-2 pt-10">
            <span className="text-3xl">🥉</span>
            <span className="mt-2 text-2xl">{top3[2].avatar}</span>
            <span className="mt-1 text-center text-xs text-white">{top3[2].displayName}</span>
            <span className="text-xs text-slate-400">{top3[2].totalXp} XP</span>
          </div>
        </div>
      )}

      <div className="mt-10">
        {data ? (
          <LeaderboardTable rows={rest.length ? rest : rows} currentUserId={user?.id} />
        ) : (
          <p className="text-slate-400">Loading…</p>
        )}
        {data?.currentUserRank != null && (
          <p className="mt-4 text-sm text-slate-400">Your rank: #{data.currentUserRank}</p>
        )}
      </div>
    </div>
  );
}

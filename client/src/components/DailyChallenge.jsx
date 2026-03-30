/** Dashboard daily challenge panel */
import { useEffect, useState } from 'react';
import api from '../services/api';
import { timeUntilMidnight } from '../utils/helpers';

export default function DailyChallenge({ onComplete }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data: d } = await api.get('/challenges/daily');
        if (!cancel) setData(d);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [onComplete]);

  if (loading) {
    return <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">Loading daily…</div>;
  }

  if (data?.completed) {
    return (
      <div className="rounded-xl border-2 border-green-500/50 bg-gradient-to-r from-blue-900/40 to-green-900/30 p-6">
        <h3 className="text-lg font-bold text-white">🎯 Daily Challenge</h3>
        <p className="mt-2 text-green-400">✅ Completed! +50 XP</p>
        <p className="mt-2 text-sm text-slate-400">Resets in {timeUntilMidnight()}</p>
      </div>
    );
  }

  const ch = data?.challenge;
  if (!ch) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-slate-400">
        No challenge available.
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-transparent bg-gradient-to-r from-blue-600/20 to-green-600/20 p-[1px]">
      <div className="rounded-xl bg-slate-900/90 p-6">
        <h3 className="text-lg font-bold text-white">🎯 Daily Challenge</h3>
        <p className="mt-2 text-slate-300">{ch.question}</p>
        <p className="mt-2 text-xs text-slate-500">Resets in {timeUntilMidnight()} (tick {tick})</p>
      </div>
    </div>
  );
}

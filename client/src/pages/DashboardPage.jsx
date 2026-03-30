/** Main hub */
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import QuestCard from '../components/QuestCard';
import StatsCard from '../components/StatsCard';
import StreakDisplay from '../components/StreakDisplay';
import XPBar from '../components/XPBar';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/constants';
import { relativeTime, timeUntilMidnight } from '../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [quests, setQuests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [daily, setDaily] = useState(null);
  const [dailyPick, setDailyPick] = useState('');
  const [dailySubmitting, setDailySubmitting] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const [s, q, a, d] = await Promise.all([
          api.get('/users/me/stats'),
          api.get('/quests'),
          api.get('/users/me/activity'),
          api.get('/challenges/daily'),
        ]);
        if (cancel) return;
        setStats(s.data);
        setQuests(q.data.quests);
        setActivity(a.data.activity);
        setDaily(d.data);
      } catch {
        /* handled by interceptor */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const recommended = useMemo(() => {
    const list = [...quests].filter((x) => x.progress?.status !== 'COMPLETED');
    const cont = list.filter((x) => x.progress?.status === 'IN_PROGRESS');
    const avail = list.filter((x) => x.progress?.status === 'AVAILABLE');
    const merged = [...cont, ...avail].slice(0, 3);
    return merged;
  }, [quests]);

  async function submitDaily() {
    if (!dailyPick || dailySubmitting || daily?.completed) return;
    setDailySubmitting(true);
    try {
      const { data } = await api.post('/challenges/daily/submit', { answer: dailyPick });
      if (data.isCorrect) toast.success(`+${data.xpEarned} XP!`, { icon: '🌟' });
      else toast.error('Not quite — try again tomorrow!');
      const { data: d2 } = await api.get('/challenges/daily');
      setDaily(d2);
      await refreshUser();
    } finally {
      setDailySubmitting(false);
    }
  }

  const week = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    const idx = today === 0 ? 6 : today - 1;
    return days.map((label, i) => {
      let state = 'future';
      if (i < idx) state = user?.streak > 0 ? 'done' : 'miss';
      if (i === idx) state = 'today';
      return { label, state };
    });
  }, [user?.streak]);

  if (!user) return null;

  const cp = stats?.categoryProgress || {};

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-7xl mx-auto"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">
          Overview
        </h1>
        <div className="text-sm font-medium text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-inner">
          Welcome back, <span className="text-white">{user.displayName || user.display_name}</span>!
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Level & XP">
          <XPBar level={user.level} currentXp={user.currentXp ?? user.current_xp} />
        </StatsCard>
        <StatsCard title="Coins">
          <div className="text-3xl font-bold text-amber-400 drop-shadow-sm">🪙 {user.coins}</div>
        </StatsCard>
        <StatsCard title="Streak">
          <StreakDisplay streak={user.streak} />
        </StatsCard>
        <StatsCard title="Lives">
          <div className="text-3xl font-bold text-red-400 drop-shadow-sm">
            ❤️ {user.lives}<span className="text-lg text-red-400/50">/5</span>
          </div>
        </StatsCard>
      </motion.div>

      <motion.div variants={itemVariants} className="relative rounded-3xl p-[1px] overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="relative rounded-[23px] bg-eq-darkest/90 backdrop-blur-xl p-6 md:p-8">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-blue-400 drop-shadow-lg">🎯</span> Daily Challenge
            </h2>
          </div>
          {daily?.completed ? (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-xl">
              ✅ Completed! +50 XP — Resets in <span className="font-mono">{timeUntilMidnight()}</span>
            </div>
          ) : daily?.challenge ? (
            <>
              <p className="mt-2 text-lg text-slate-200 font-medium">{daily.challenge.question}</p>
              <div className="mt-6 space-y-3">
                {(daily.challenge.options || []).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDailyPick(opt)}
                    className={`w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all duration-200 focus:outline-none ${
                      dailyPick === opt
                        ? 'border-blue-500 bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  disabled={!dailyPick || dailySubmitting}
                  onClick={submitDaily}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-bold text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.6)] disabled:opacity-50 transition-all active:scale-95"
                >
                  {dailySubmitting ? 'Submitting...' : 'Submit Answer'}
                </button>
                <p className="text-xs text-slate-500 font-mono">Resets in {timeUntilMidnight()}</p>
              </div>
            </>
          ) : (
            <div className="mt-4 flex animate-pulse items-center gap-2 text-slate-400">
              <div className="h-4 w-4 rounded-full bg-slate-600" /> Loading challenge...
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📅</span> This Week
          </h3>
          <div className="mt-8 flex justify-between gap-1">
            {week.map((d) => (
              <div key={d.label} className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all ${
                    d.state === 'done'
                      ? 'border-green-500 bg-green-500/20 text-xl shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : d.state === 'miss'
                        ? 'border-red-500/50 bg-red-900/20 opacity-50'
                        : d.state === 'today'
                          ? 'border-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                          : 'border-white/5 bg-white/5'
                  }`}
                >
                  {d.state === 'done' ? '🔥' : d.state === 'miss' ? '❌' : '·'}
                </motion.div>
                <span className={`mt-3 text-xs font-medium uppercase tracking-wider ${d.state === 'today' ? 'text-blue-400' : 'text-slate-500'}`}>{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-between text-sm text-slate-400 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
            <span>Current Streak: <strong className="text-orange-400">{user.streak} days</strong></span>
            <span>Best: <strong className="text-slate-200">{user.longestStreak ?? user.longest_streak} days</strong></span>
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Skill Trees
          </h3>
          <div className="mt-6 flex flex-col gap-4">
            {CATEGORY_ORDER.map((cat, i) => {
              const key = ['micro', 'macro', 'personalFinance', 'behavioral'][i];
              const pct = cp[key] ?? 0;
              const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-pink-500'];
              return (
                <ProgressBar
                  key={cat}
                  label={CATEGORY_LABELS[cat]}
                  value={pct}
                  max={100}
                  color={colors[i]}
                />
              );
            })}
          </div>
        </div>
      </motion.div>

      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span>🚀</span> Continue Learning
          </h2>
        </div>
        {recommended.length === 0 ? (
          <div className="glass-panel rounded-3xl p-8 text-center border-dashed border-white/10">
            <span className="text-4xl block mb-3">🎉</span>
            <p className="text-lg text-slate-300 font-medium">You&apos;ve completed all available quests!</p>
            <p className="text-slate-500 mt-1">Check back later for new content.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {recommended.map((q) => (
              <QuestCard key={q.id} quest={q} compact />
            ))}
          </div>
        )}
      </motion.section>

      <motion.section variants={itemVariants}>
        <h2 className="mb-6 text-2xl font-bold text-white flex items-center gap-2">
          <span>📋</span> Recent Activity
        </h2>
        <div className="glass-panel rounded-3xl divide-y divide-white/5 overflow-hidden">
          {(activity || []).map((item, idx) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="flex gap-4 px-6 py-4 text-sm text-slate-200 hover:bg-white/5 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xl shadow-sm">
                {item.type === 'quest' ? '⭐' : '🏅'}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {item.type === 'quest' ? (
                  <span className="font-medium text-white text-base">
                    Completed &quot;<span className="text-blue-300">{item.title}</span>&quot; {item.stars ? '⭐'.repeat(item.stars) : ''}
                  </span>
                ) : (
                  <span className="font-medium text-white text-base">
                    Earned achievement: <span className="text-amber-400">{item.name}</span> {item.icon}
                  </span>
                )}
                <div className="text-xs text-slate-500 mt-1 font-mono">{relativeTime(item.ts)}</div>
              </div>
            </motion.div>
          ))}
          {!activity?.length && (
            <div className="p-8 text-center text-slate-500 font-medium bg-white/5">
              No activity yet — start a quest to build your history!
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}

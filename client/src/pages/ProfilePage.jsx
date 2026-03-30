/** Profile + edit modal */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import XPBar from '../components/XPBar';
import ProgressBar from '../components/ProgressBar';
import { AVATAR_OPTIONS, CATEGORY_LABELS, CATEGORY_ORDER } from '../utils/constants';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAch, setRecentAch] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([api.get('/users/me/stats'), api.get('/achievements')]);
      setStats(s.data);
      const unlocked = (a.data.achievements || []).filter((x) => x.unlocked).slice(0, 4);
      setRecentAch(unlocked);
    })();
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.displayName || user.display_name || '');
      setAvatar(user.avatar);
    }
  }, [user]);

  async function save() {
    await api.patch('/users/me', { displayName: name, avatar });
    await refreshUser();
    toast.success('Profile updated');
    setOpen(false);
  }

  if (!user) return null;

  const cp = stats?.categoryProgress || {};

  return (
    <div>
      <div className="flex flex-col items-center text-center md:flex-row md:items-start md:gap-8 md:text-left">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 text-6xl">
          {user.avatar}
        </div>
        <div className="mt-4 flex-1 md:mt-0">
          <h1 className="text-2xl font-bold text-white">{user.displayName || user.display_name}</h1>
          <p className="text-slate-400">{user.title}</p>
          <span className="mt-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
            Level {user.level}
          </span>
          <div className="mt-4 max-w-md">
            <XPBar level={user.level} currentXp={user.currentXp ?? user.current_xp} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 rounded-xl bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            ['⭐ Total XP', stats.totalXp],
            ['📚 Quests Done', stats.questsCompleted],
            ['✅ Challenges', stats.challengesSolved],
            ['🎯 Accuracy', `${stats.accuracy}%`],
            ['🔥 Streak', `${stats.currentStreak} days`],
            ['🏅 Achievements', `${stats.achievementsUnlocked}`],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <div className="text-xs text-slate-400">{l}</div>
              <div className="mt-1 text-lg font-bold text-white">{v}</div>
            </div>
          ))}
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-white">Category Mastery</h2>
        <div className="mt-4 space-y-3">
          {CATEGORY_ORDER.map((cat, i) => {
            const key = ['micro', 'macro', 'personalFinance', 'behavioral'][i];
            const pct = cp[key] ?? 0;
            const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500'];
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
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Achievements</h2>
          <Link to="/achievements" className="text-sm text-blue-400 hover:underline">
            View All →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {recentAch.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <div className="font-semibold text-white">{a.name}</div>
                  <div className="text-xs text-slate-500">
                    {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : ''}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!recentAch.length && <p className="text-slate-500">No achievements yet.</p>}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6">
            <h3 className="text-lg font-bold text-white">Edit Profile</h3>
            <label className="mt-4 block text-sm text-slate-300">Display Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-3 py-2 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="mt-4 text-sm text-slate-300">Avatar</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`flex h-14 items-center justify-center rounded-full text-2xl ${
                    avatar === a ? 'ring-2 ring-blue-500' : 'bg-slate-700'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={save}
                className="flex-1 rounded-xl bg-blue-600 py-2 font-semibold text-white"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-slate-700 py-2 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Register */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { AVATAR_OPTIONS, START_PATHS } from '../utils/constants';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const MAX = 50;
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [interest, setInterest] = useState(START_PATHS[0].key);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (username.length < 3) e.username = 'At least 3 characters';
    if (!displayName.trim()) e.displayName = 'Required';
    if (password.length < 6) e.password = 'At least 6 characters';
    if (password !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register({
        username,
        email,
        password,
        displayName,
        avatar,
      });
      // interest is client-only highlight; backend unlocks by prerequisites
      localStorage.setItem('econquest_interest', interest);
      toast.success('Welcome to EconQuest! 🎉');
      nav('/dashboard');
    } catch (ex) {
      const msg = ex.response?.data?.error || 'Could not register';
      if (msg.includes('taken')) setErrors({ form: 'Username or email already taken' });
      else setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-eq-dark px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Create Your Account</h1>
        <p className="text-slate-400">Start your economics journey today</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Username</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value.slice(0, MAX))}
              required
            />
            {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-300">Display Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            {errors.displayName && <p className="mt-1 text-sm text-red-400">{errors.displayName}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm text-slate-300">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {errors.confirm && <p className="mt-1 text-sm text-red-400">{errors.confirm}</p>}
          </div>

          <div>
            <p className="text-sm text-slate-300">Choose Your Avatar</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`flex h-16 items-center justify-center rounded-full text-3xl ${
                    avatar === a ? 'ring-2 ring-blue-500' : 'bg-slate-700'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-slate-300">What interests you most?</p>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {START_PATHS.map((p) => (
                <button
                  type="button"
                  key={p.key}
                  onClick={() => setInterest(p.key)}
                  className={`rounded-xl px-3 py-2 text-left text-sm ${
                    interest === p.key ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center text-slate-400">
          Already have an account?{' '}
          <Link className="text-blue-400 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Login */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 👋');
      nav('/dashboard');
    } catch {
      setErr('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-eq-dark px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-800 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
        <p className="text-slate-400">Continue your economics adventure</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300">Password</label>
            <input
              className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-slate-400">
          Don&apos;t have an account?{' '}
          <Link className="text-blue-400 hover:underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

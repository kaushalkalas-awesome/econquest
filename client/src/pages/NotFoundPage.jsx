/** 404 */
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-eq-dark px-4 text-center">
      <div className="text-8xl font-bold text-slate-600">404</div>
      <p className="mt-4 text-xl text-white">Oops! This page doesn&apos;t exist.</p>
      <p className="mt-2 text-slate-400">Looks like you&apos;ve wandered off the quest map.</p>
      <Link
        to="/dashboard"
        className="mt-8 rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

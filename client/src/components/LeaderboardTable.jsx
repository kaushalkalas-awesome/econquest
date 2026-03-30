/** Leaderboard rows */
export default function LeaderboardTable({ rows, currentUserId }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-800 text-slate-400">
          <tr>
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Avatar</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Level</th>
            <th className="px-4 py-2">XP</th>
            <th className="px-4 py-2">Quests</th>
            <th className="px-4 py-2">Streak</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.userId}
              className={`${
                r.userId === currentUserId
                  ? 'bg-blue-900/30 border-l-2 border-blue-500'
                  : i % 2 === 0
                    ? 'bg-slate-800/80'
                    : 'bg-slate-800/40'
              }`}
            >
              <td
                className={`px-4 py-2 font-semibold ${
                  r.rank === 1
                    ? 'text-amber-400'
                    : r.rank === 2
                      ? 'text-slate-300'
                      : r.rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-200'
                }`}
              >
                #{r.rank}
              </td>
              <td className="px-4 py-2 text-xl">{r.avatar}</td>
              <td className="px-4 py-2 text-white">{r.displayName}</td>
              <td className="px-4 py-2 text-slate-300">{r.level}</td>
              <td className="px-4 py-2 text-slate-300">{r.totalXp}</td>
              <td className="px-4 py-2 text-slate-300">{r.questsCompleted}</td>
              <td className="px-4 py-2 text-slate-300">{r.streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

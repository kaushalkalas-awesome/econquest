/** Achievement tile for grid */
const rarityClass = {
  COMMON: 'bg-gray-600/40 text-gray-200',
  UNCOMMON: 'bg-green-600/20 text-green-400',
  RARE: 'bg-blue-600/20 text-blue-400',
  EPIC: 'bg-purple-600/20 text-purple-400',
  LEGENDARY: 'bg-amber-600/20 text-amber-400',
};

export default function AchievementCard({ a }) {
  const unlocked = a.unlocked;
  return (
    <div
      className={`relative rounded-xl border p-4 ${
        unlocked
          ? 'border-amber-500 bg-slate-800/80'
          : 'border-slate-700 bg-slate-800/50 opacity-50 grayscale'
      }`}
    >
      {!unlocked && <div className="absolute right-2 top-2 text-xl">🔒</div>}
      {unlocked && <div className="absolute right-2 top-2 text-green-400">✅</div>}
      <div className="text-3xl">{a.icon}</div>
      <h3 className="mt-2 font-bold text-white">{a.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{a.description}</p>
      <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${rarityClass[a.rarity]}`}>
        {a.rarity}
      </span>
      {unlocked && a.unlockedAt && (
        <p className="mt-2 text-xs text-slate-500">Unlocked {new Date(a.unlockedAt).toLocaleDateString()}</p>
      )}
      {!unlocked && a.progress != null && (
        <div className="mt-2">
          <div className="h-2 rounded-full bg-slate-700">
            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${a.progress}%` }} />
          </div>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-500">
        +{a.xp_reward} XP {a.coin_reward ? `, +${a.coin_reward} 🪙` : ''}
      </p>
    </div>
  );
}

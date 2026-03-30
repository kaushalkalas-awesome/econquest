/** Single shop row/card */
export default function ShopItemCard({ item, onBuy, onEquip, canAfford }) {
  const owned = item.owned;
  const equipped = item.equipped;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-center transition-transform hover:scale-[1.02]">
      <div className="text-4xl">{item.icon}</div>
      <h3 className="mt-2 font-bold text-white">{item.name}</h3>
      <p className="mt-1 text-sm text-slate-400">{item.description}</p>
      <p className="mt-2 text-amber-300">
        {item.currency === 'GEMS' ? '💎' : '🪙'} {item.price}
      </p>
      <span className="mt-1 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-xs">{item.type}</span>
      <div className="mt-3 flex flex-col gap-2">
        {!owned && (
      <button
        type="button"
        disabled={!canAfford}
        onClick={() => onBuy(item)}
        className={`rounded-xl py-2 font-semibold ${
          canAfford ? 'bg-blue-600 text-white hover:bg-blue-700' : 'cursor-not-allowed bg-slate-600 text-slate-400'
        }`}
        title={!canAfford ? 'Not enough coins' : ''}
      >
            Buy
          </button>
        )}
        {owned && (
          <>
            <span className="rounded-lg bg-green-600/30 py-1 text-sm text-green-400">Owned ✅</span>
            {(item.type === 'AVATAR' || item.type === 'TITLE') && (
              <button
                type="button"
                onClick={() => onEquip(item)}
                className={`rounded-xl py-2 font-semibold ${
                  equipped ? 'bg-amber-600/30 text-amber-300' : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {equipped ? 'Equipped' : 'Equip'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** Shop */
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ShopItemCard from '../components/ShopItemCard';

export default function ShopPage() {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [modal, setModal] = useState(null);

  async function load() {
    const { data } = await api.get('/shop/items');
    setItems(data.items);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered =
    tab === 'ALL'
      ? items
      : items.filter((i) =>
          tab === 'AVATAR'
            ? i.type === 'AVATAR'
            : tab === 'TITLE'
              ? i.type === 'TITLE'
              : i.type === 'POWER_UP'
        );

  async function confirmBuy() {
    if (!modal) return;
    try {
      const { data } = await api.post(`/shop/purchase/${modal.id}`);
      toast.success(`Purchased ${modal.name}! 🎉`);
      await refreshUser();
      setModal(null);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Purchase failed');
    }
  }

  async function equip(item) {
    await api.post(`/shop/equip/${item.id}`);
    toast.success('Equipped!');
    await refreshUser();
    await load();
  }

  if (!user) return null;

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">🛍️ Shop</h1>
        <p className="text-amber-300">
          🪙 {user.coins} Coins | 💎 {user.gems} Gems
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {['ALL', 'AVATAR', 'TITLE', 'POWER_UP'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {t === 'ALL'
              ? 'All'
              : t === 'AVATAR'
                ? '😀 Avatars'
                : t === 'TITLE'
                  ? '📛 Titles'
                  : '⚡ Power-Ups'}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {filtered.map((item) => {
          const canAfford =
            item.currency === 'GEMS' ? user.gems >= item.price : user.coins >= item.price;
          return (
            <ShopItemCard
              key={item.id}
              item={item}
              canAfford={canAfford || item.owned}
              onBuy={() => setModal(item)}
              onEquip={() => equip(item)}
            />
          );
        })}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-6">
            <h3 className="text-lg font-bold text-white">Confirm purchase</h3>
            <p className="mt-2 text-slate-300">
              Buy {modal.name} for {modal.currency === 'GEMS' ? '💎' : '🪙'} {modal.price}?
            </p>
            <p className="mt-2 text-sm text-slate-400">Your balance: 🪙 {user.coins}</p>
            <p className="text-sm text-slate-400">
              After: 🪙 {user.coins - (modal.currency === 'COINS' ? modal.price : 0)}
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={confirmBuy}
                className="flex-1 rounded-xl bg-blue-600 py-2 font-semibold text-white"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setModal(null)}
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

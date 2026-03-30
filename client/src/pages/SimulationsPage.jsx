/** Client-side economic simulators */
import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

function SupplyDemandSim() {
  const [income, setIncome] = useState(50);
  const [suppliers, setSuppliers] = useState(50);
  const [substitutes, setSubstitutes] = useState(50);
  const [cost, setCost] = useState(50);

  const chartData = useMemo(() => {
    const baseD = 30 + income * 0.4 + substitutes * 0.3;
    const baseS = 10 + suppliers * 0.4;
    
    // Exact continuous equilibrium calculation
    const eqP = (baseD - baseS + income * 0.02 + cost * 0.15) / 5;
    const eqQ = baseS - cost * 0.15 + eqP * 2;

    const pts = [];
    // Q is the independent variable on the X-axis (Quantity)
    for (let q = 0; q <= 100; q += 5) {
      // P = (Q_d intercept - Q) / slope
      const dPrice = (baseD + income * 0.02 - q) / 3;
      // P = (Q - Q_s intercept) / slope
      const sPrice = (q - baseS + cost * 0.15) / 2;
      
      pts.push({ 
        q, 
        demand: dPrice >= 0 ? Math.round(dPrice * 10) / 10 : null, 
        supply: sPrice >= 0 ? Math.round(sPrice * 10) / 10 : null 
      });
    }
    
    return { pts, eqP: Math.max(0, Math.round(eqP * 10) / 10), eqQ: Math.max(0, Math.round(eqQ * 10) / 10) };
  }, [income, suppliers, substitutes, cost]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {[
          ['Consumer Income', income, setIncome],
          ['Number of Suppliers', suppliers, setSuppliers],
          ['Price of Substitutes', substitutes, setSubstitutes],
          ['Production Cost', cost, setCost],
        ].map(([label, val, set]) => (
          <div key={label}>
            <label className="text-sm text-slate-300">{label}</label>
            <input
              type="range"
              min={0}
              max={100}
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-slate-500">{val}</span>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            setIncome(50);
            setSuppliers(50);
            setSubstitutes(50);
            setCost(50);
          }}
          className="rounded-xl bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
        >
          Reset to Default
        </button>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData.pts} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <XAxis dataKey="q" name="Quantity" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="demand" stroke="#2563EB" dot={false} name="Demand (Price)" connectNulls={false} />
            <Line type="monotone" dataKey="supply" stroke="#10B981" dot={false} name="Supply (Price)" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-center text-slate-300">
          Equilibrium Price: ${chartData.eqP} | Quantity: {chartData.eqQ} units
        </p>
        <p className="mt-1 text-center text-xs text-slate-500">
          Chart: Price at each quantity level (Standard Economics graph).
        </p>
      </div>
    </div>
  );
}

const BUDGET_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#A855F7', '#EF4444', '#06B6D4', '#94A3B8'];

function BudgetSim() {
  const [income, setIncome] = useState(3000);
  const [cats, setCats] = useState({
    housing: 30,
    food: 15,
    transport: 10,
    entertainment: 10,
    healthcare: 5,
    savings: 20,
    other: 10,
  });

  const totalPct = Object.values(cats).reduce((a, b) => a + b, 0);
  const scale = totalPct === 0 ? 0 : 100 / totalPct;

  const slices = Object.entries(cats).map(([k, v], i) => ({
    name: k,
    value: Math.round(v * scale * 10) / 10,
    amt: Math.round(((income * v * scale) / 100) * 100) / 100,
    color: BUDGET_COLORS[i % BUDGET_COLORS.length],
  }));

  let score = 0;
  const sh = (cats.savings * scale) / 100;
  const hh = (cats.housing * scale) / 100;
  const ent = (cats.entertainment * scale) / 100;
  const hc = (cats.healthcare * scale) / 100;
  if (sh >= 0.2) score += 30;
  if (hh <= 0.3) score += 20;
  if (Math.max(...Object.values(cats)) * scale <= 40) score += 20;
  if (ent <= 0.15) score += 15;
  if (hc >= 0.05) score += 15;
  score = Math.min(100, score);

  const tips = [];
  if (hh > 0.3) tips.push('⚠️ Housing is above 30% — may strain your budget');
  if (sh >= 0.2) tips.push('✅ Great savings rate (20%+)');
  if (hc < 0.05) tips.push('💡 Consider increasing healthcare allocation');

  function setCat(key, val) {
    setCats((c) => ({ ...c, [key]: Number(val) }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <label className="text-sm text-slate-300">Monthly Income ($)</label>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-white"
          value={income}
          min={100}
          onChange={(e) => setIncome(Number(e.target.value))}
        />
        <p className="mt-2 text-xs text-amber-300">Total sliders: {Math.round(totalPct)}% (scaled to 100%)</p>
        <div className="mt-4 space-y-3">
          {Object.entries(cats).map(([k, v], i) => (
            <div key={k}>
              <div className="flex justify-between text-sm text-slate-300">
                <span>
                  {['🏠 Housing', '🍕 Food', '🚗 Transport', '🎭 Entertainment', '💊 Healthcare', '💰 Savings', '📦 Other'][i]}
                </span>
                <span>{Math.round(v * scale)}% → ${Math.round((income * v * scale) / 100)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={v}
                onChange={(e) => setCat(k, e.target.value)}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
      <div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={slices} dataKey="amt" nameKey="name" outerRadius={90} label>
              {slices.map((s, i) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <p
          className={`mt-2 text-center text-lg font-bold ${
            score >= 80 ? 'text-green-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}
        >
          Financial Health Score: {score}/100
        </p>
        <ul className="mt-3 space-y-1 text-sm text-slate-300">
          {tips.length ? tips.map((t) => <li key={t}>{t}</li>) : <li>Adjust sliders to see tips.</li>}
        </ul>
      </div>
    </div>
  );
}

const STOCKS_INIT = [
  { id: 1, name: 'EcoTech', sector: 'Technology', price: 45, shares: 0, avg: 0 },
  { id: 2, name: 'GreenGrow', sector: 'Agriculture', price: 28, shares: 0, avg: 0 },
  { id: 3, name: 'FinanceFirst', sector: 'Banking', price: 72, shares: 0, avg: 0 },
  { id: 4, name: 'HealthPlus', sector: 'Healthcare', price: 55, shares: 0, avg: 0 },
  { id: 5, name: 'EduLearn', sector: 'Education', price: 33, shares: 0, avg: 0 },
  { id: 6, name: 'EnergyMax', sector: 'Energy', price: 61, shares: 0, avg: 0 },
];

function StockSim() {
  const [cash, setCash] = useState(10000);
  const [stocks, setStocks] = useState(STOCKS_INIT);
  const [day, setDay] = useState(0);
  const [news, setNews] = useState('Welcome! Trade carefully.');
  const [history, setHistory] = useState([{ day: 0, value: 10000 }]);

  const portfolioValue = stocks.reduce((s, x) => s + x.shares * x.price, 0);
  const total = cash + portfolioValue;

  function advanceDay() {
    const ev = ['EcoTech announces a new product!', 'Energy prices fall globally.', 'Bank stocks rally on rate news.'][
      Math.floor(Math.random() * 3)
    ];
    setNews(ev);
    setStocks((prev) => {
      const next = prev.map((s) => {
        const ch = (Math.random() * 10 - 5) / 100;
        const np = Math.max(1, Math.round(s.price * (1 + ch) * 100) / 100);
        return { ...s, price: np };
      });
      const port = next.reduce((s, x) => s + x.shares * x.price, 0);
      const tot = cash + port;
      setHistory((h) => [...h, { day: day + 1, value: Math.round(tot) }]);
      return next;
    });
    setDay((d) => d + 1);
  }

  function buy(id) {
    const s = stocks.find((x) => x.id === id);
    const q = Number(prompt('How many shares?', '1'));
    if (!q || q < 1) return;
    const cost = q * s.price;
    if (cost > cash) {
      alert('Not enough cash');
      return;
    }
    setCash((c) => c - cost);
    setStocks((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        const ns = x.shares + q;
        const avg = ns ? Math.round(((x.avg * x.shares + cost) / ns) * 100) / 100 : 0;
        return { ...x, shares: ns, avg };
      })
    );
  }

  function sell(id) {
    const s = stocks.find((x) => x.id === id);
    const q = Number(prompt('How many shares?', '1'));
    if (!q || q < 1 || q > s.shares) return;
    setCash((c) => c + q * s.price);
    setStocks((prev) =>
      prev.map((x) => (x.id === id ? { ...x, shares: x.shares - q, avg: x.avg } : x))
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-800/60 p-4 text-slate-200">{news}</div>
      <div className="flex flex-wrap gap-3 text-sm text-slate-300">
        <span>Cash: ${Math.round(cash)}</span>
        <span>Portfolio: ${Math.round(portfolioValue)}</span>
        <span className="font-semibold text-white">Total: ${Math.round(total)}</span>
        <span>Day: {day}</span>
      </div>
      <button
        type="button"
        onClick={advanceDay}
        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Advance Day
      </button>
      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400">
            <tr>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Sector</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Buy/Sell</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => {
              const ch = STOCKS_INIT.find((x) => x.id === s.id).price;
              const delta = Math.round(((s.price - ch) / ch) * 1000) / 10;
              return (
                <tr key={s.id} className="border-t border-slate-800">
                  <td className="px-3 py-2 text-white">{s.name}</td>
                  <td className="px-3 py-2 text-slate-400">{s.sector}</td>
                  <td className="px-3 py-2">
                    ${s.price}{' '}
                    <span className={delta >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ({delta >= 0 ? '+' : ''}
                      {delta}%)
                    </span>
                  </td>
                  <td className="px-3 py-2 space-x-2">
                    <button type="button" onClick={() => buy(s.id)} className="text-blue-400 hover:underline">
                      Buy
                    </button>
                    <button type="button" onClick={() => sell(s.id)} className="text-amber-400 hover:underline">
                      Sell
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={history}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#10B981" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <button
        type="button"
        onClick={() => {
          setCash(10000);
          setStocks(STOCKS_INIT);
          setDay(0);
          setHistory([{ day: 0, value: 10000 }]);
          setNews('Simulation reset.');
        }}
        className="rounded-xl border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
      >
        Reset Simulation
      </button>
    </div>
  );
}

export default function SimulationsPage() {
  const [open, setOpen] = useState('sd');

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">🎮 Economic Simulations</h1>
      <p className="text-slate-400">Apply what you learned in interactive scenarios</p>

      <div className="mt-6 space-y-4">
        <button
          type="button"
          onClick={() => setOpen('sd')}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left hover:border-blue-500/50"
        >
          <div className="text-lg font-bold text-white">📊 Supply & Demand Simulator</div>
          <p className="text-sm text-slate-400">Slide inputs and watch equilibrium move</p>
        </button>
        {open === 'sd' && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <SupplyDemandSim />
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen('bud')}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left hover:border-blue-500/50"
        >
          <div className="text-lg font-bold text-white">💰 Personal Budget Planner</div>
          <p className="text-sm text-slate-400">Allocate income and see a health score</p>
        </button>
        {open === 'bud' && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <BudgetSim />
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen('stk')}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-left hover:border-blue-500/50"
        >
          <div className="text-lg font-bold text-white">📈 Stock Market Simulator</div>
          <p className="text-sm text-slate-400">Virtual trades with random daily moves</p>
        </button>
        {open === 'stk' && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
            <StockSim />
          </div>
        )}
      </div>
    </div>
  );
}

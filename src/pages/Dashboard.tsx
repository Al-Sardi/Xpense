import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { formatCurrency, formatPercent, getMonthYear, getMonthName } from '../utils/format';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#8b5cf6', '#06b6d4'];

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#1e293b',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

export function Dashboard() {
  const { expenses, incomes } = useStore();

  const months = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => set.add(getMonthYear(e.datum)));
    incomes.forEach((i) => set.add(getMonthYear(i.datum)));
    return Array.from(set).sort().reverse();
  }, [expenses, incomes]);

  const [selectedMonth, setSelectedMonth] = useState<string>('alle');

  const filteredExpenses = useMemo(
    () => (selectedMonth === 'alle' ? expenses : expenses.filter((e) => getMonthYear(e.datum) === selectedMonth)),
    [expenses, selectedMonth]
  );

  const filteredIncomes = useMemo(
    () => (selectedMonth === 'alle' ? incomes : incomes.filter((i) => getMonthYear(i.datum) === selectedMonth)),
    [incomes, selectedMonth]
  );

  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.betrag, 0);
  const totalIncomes = filteredIncomes.reduce((s, i) => s + i.betrag, 0);
  const saldo = totalIncomes - totalExpenses;
  const sparquote = totalIncomes > 0 ? (saldo / totalIncomes) * 100 : 0;

  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredExpenses.forEach((e) => map.set(e.kategorie, (map.get(e.kategorie) ?? 0) + e.betrag));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses]);

  const incomesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    filteredIncomes.forEach((i) => map.set(i.kategorie, (map.get(i.kategorie) ?? 0) + i.betrag));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredIncomes]);

  const top5 = useMemo(
    () => [...filteredExpenses].sort((a, b) => b.betrag - a.betrag).slice(0, 5),
    [filteredExpenses]
  );

  const kontoDaten = useMemo(() => {
    const map = new Map<string, { einnahmen: number; ausgaben: number }>();
    filteredIncomes.forEach((i) => {
      const curr = map.get(i.konto) ?? { einnahmen: 0, ausgaben: 0 };
      curr.einnahmen += i.betrag;
      map.set(i.konto, curr);
    });
    filteredExpenses.forEach((e) => {
      const curr = map.get(e.konto) ?? { einnahmen: 0, ausgaben: 0 };
      curr.ausgaben += e.betrag;
      map.set(e.konto, curr);
    });
    return Array.from(map.entries()).map(([konto, data]) => ({
      konto,
      ...data,
      netto: data.einnahmen - data.ausgaben,
    }));
  }, [filteredExpenses, filteredIncomes]);

  // Monthly overview data
  const year = 2026;
  const monthlyRows = useMemo(() => {
    const data: { month: number; label: string; einnahmen: number; ausgaben: number; saldo: number; sparquote: number; avgPerDay: number; transactions: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const prefix = `${year}-${String(m + 1).padStart(2, '0')}`;
      const mExp = expenses.filter((e) => e.datum.startsWith(prefix));
      const mInc = incomes.filter((i) => i.datum.startsWith(prefix));
      const ein = mInc.reduce((s, i) => s + i.betrag, 0);
      const aus = mExp.reduce((s, e) => s + e.betrag, 0);
      const sal = ein - aus;
      data.push({ month: m, label: getMonthName(m), einnahmen: ein, ausgaben: aus, saldo: sal, sparquote: ein > 0 ? (sal / ein) * 100 : 0, avgPerDay: aus / new Date(year, m + 1, 0).getDate(), transactions: mExp.length + mInc.length });
    }
    return data;
  }, [expenses, incomes]);

  const monthlyTotals = useMemo(() => {
    const ein = monthlyRows.reduce((s, r) => s + r.einnahmen, 0);
    const aus = monthlyRows.reduce((s, r) => s + r.ausgaben, 0);
    const sal = ein - aus;
    return { einnahmen: ein, ausgaben: aus, saldo: sal, sparquote: ein > 0 ? (sal / ein) * 100 : 0, transactions: monthlyRows.reduce((s, r) => s + r.transactions, 0) };
  }, [monthlyRows]);

  const monthlyChartData = monthlyRows
    .filter((r) => r.transactions > 0)
    .map((r) => ({ name: r.label.substring(0, 3), Einnahmen: r.einnahmen, Ausgaben: r.ausgaben }));

  const barData = [
    { name: 'Einnahmen', value: totalIncomes, fill: '#10B981' },
    { name: 'Ausgaben', value: totalExpenses, fill: '#ef4444' },
    { name: 'Saldo', value: saldo, fill: saldo >= 0 ? '#6366f1' : '#ef4444' },
  ];

  const formatMonthLabel = (m: string) => {
    const [y, mo] = m.split('-');
    return `${getMonthName(parseInt(mo) - 1)} ${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Balance */}
      <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center justify-between mb-1">
          <p className="text-indigo-100 text-sm font-medium">Verfügbares Saldo</p>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white outline-none backdrop-blur-sm border border-white/20"
          >
            <option value="alle">Alle</option>
            {months.map((m) => (
              <option key={m} value={m}>{formatMonthLabel(m)}</option>
            ))}
          </select>
        </div>
        <h2 className="text-3xl font-bold mb-4">{formatCurrency(saldo)}</h2>
        <div className="flex gap-3">
          <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1 text-emerald-300 text-xs font-medium mb-1">
              <TrendingUp size={14} /> Einnahmen
            </div>
            <p className="font-semibold text-sm">{formatCurrency(totalIncomes)}</p>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-1 text-rose-300 text-xs font-medium mb-1">
              <TrendingDown size={14} /> Ausgaben
            </div>
            <p className="font-semibold text-sm">{formatCurrency(totalExpenses)}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          icon={<Wallet size={18} />}
          label="Saldo"
          value={formatCurrency(saldo)}
          iconBg={saldo >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}
          valueColor={saldo >= 0 ? 'text-emerald-600' : 'text-red-600'}
        />
        <KPICard
          icon={<Percent size={18} />}
          label="Sparquote"
          value={formatPercent(sparquote)}
          iconBg={sparquote >= 20 ? 'bg-emerald-100 text-emerald-600' : sparquote >= 10 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}
          valueColor={sparquote >= 20 ? 'text-emerald-600' : sparquote >= 10 ? 'text-amber-600' : 'text-red-600'}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Doughnut */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Ausgaben nach Kategorie</h3>
          {expensesByCategory.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {expensesByCategory.map((d, i) => {
                  const pct = totalExpenses > 0 ? (d.value / totalExpenses) * 100 : 0;
                  return (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600 truncate">{d.name}</span>
                      <span className="font-semibold ml-auto">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-slate-400">Keine Daten</p>
          )}
        </div>

        {/* Bar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Einnahmen vs. Ausgaben</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <CategoryTable title="Ausgaben nach Kategorie" data={expensesByCategory} total={totalExpenses} color="#ef4444" />
        <CategoryTable title="Einnahmen nach Kategorie" data={incomesByCategory} total={totalIncomes} color="#10B981" />
      </div>

      {/* Top 5 Expenses */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Top 5 Ausgaben</h3>
        <div className="space-y-2">
          {top5.map((e, i) => (
            <div key={e.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{e.ausgabe}</p>
                  <p className="text-xs text-slate-500">{e.kategorie}</p>
                </div>
              </div>
              <span className="font-bold text-slate-800">{formatCurrency(e.betrag)}</span>
            </div>
          ))}
          {top5.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Keine Ausgaben</p>}
        </div>
      </div>

      {/* Kontoübersicht */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">Konten</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="pb-3 font-medium">Konto</th>
                <th className="pb-3 text-right font-medium">Einnahmen</th>
                <th className="pb-3 text-right font-medium">Ausgaben</th>
                <th className="pb-3 text-right font-medium">Netto</th>
              </tr>
            </thead>
            <tbody>
              {kontoDaten.map((k) => (
                <tr key={k.konto} className="border-b border-slate-50">
                  <td className="py-3 font-medium text-slate-800">{k.konto}</td>
                  <td className="py-3 text-right text-emerald-600 font-medium">{formatCurrency(k.einnahmen)}</td>
                  <td className="py-3 text-right text-rose-600 font-medium">{formatCurrency(k.ausgaben)}</td>
                  <td className={`py-3 text-right font-bold ${k.netto >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(k.netto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Monatsübersicht */}
      {monthlyChartData.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Monatsverlauf {year}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyChartData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="Einnahmen" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: '#10B981' }} />
              <Line type="monotone" dataKey="Ausgaben" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <h3 className="px-5 pt-5 pb-2 font-semibold text-slate-800">Monatsübersicht {year}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Monat</th>
                <th className="px-4 py-3 font-medium text-right">Einnahmen</th>
                <th className="px-4 py-3 font-medium text-right">Ausgaben</th>
                <th className="px-4 py-3 font-medium text-right">Saldo</th>
                <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">Sparquote</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((r) => (
                <tr key={r.month} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${r.transactions === 0 ? 'opacity-35' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.label}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(r.einnahmen)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatCurrency(r.ausgaben)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${r.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(r.saldo)}</td>
                  <td className={`hidden px-4 py-3 text-right sm:table-cell font-medium ${r.sparquote >= 20 ? 'text-emerald-600' : r.sparquote >= 10 ? 'text-amber-500' : 'text-rose-600'}`}>
                    {r.transactions > 0 ? formatPercent(r.sparquote) : '–'}
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                <td className="px-4 py-3 text-slate-800">Gesamt</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(monthlyTotals.einnahmen)}</td>
                <td className="px-4 py-3 text-right text-rose-600">{formatCurrency(monthlyTotals.ausgaben)}</td>
                <td className={`px-4 py-3 text-right ${monthlyTotals.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatCurrency(monthlyTotals.saldo)}</td>
                <td className={`hidden px-4 py-3 text-right sm:table-cell ${monthlyTotals.sparquote >= 20 ? 'text-emerald-600' : monthlyTotals.sparquote >= 10 ? 'text-amber-500' : 'text-rose-600'}`}>{formatPercent(monthlyTotals.sparquote)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon, label, value, iconBg, valueColor }: { icon: React.ReactNode; label: string; value: string; iconBg: string; valueColor: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex items-center justify-center rounded-xl p-2 ${iconBg}`}>
        {icon}
      </div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

function CategoryTable({ title, data, total, color }: { title: string; data: { name: string; value: number }[]; total: number; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
      <div className="space-y-3">
        {data.map((d) => {
          const pct = total > 0 ? (d.value / total) * 100 : 0;
          return (
            <div key={d.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{d.name}</span>
                <span className="text-slate-800 font-medium">
                  {formatCurrency(d.value)} <span className="text-slate-400">({pct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
        {data.length === 0 && <p className="py-4 text-center text-sm text-slate-400">Keine Daten</p>}
      </div>
    </div>
  );
}

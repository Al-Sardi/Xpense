import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { formatCurrency, formatPercent, getMonthName } from '../utils/format';

interface MonthRow {
  month: number;
  label: string;
  einnahmen: number;
  ausgaben: number;
  saldo: number;
  sparquote: number;
  avgPerDay: number;
  transactions: number;
}

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  color: '#1e293b',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

export function Monatsuebersicht() {
  const { expenses, incomes } = useStore();
  const year = 2026;

  const rows = useMemo(() => {
    const data: MonthRow[] = [];
    for (let m = 0; m < 12; m++) {
      const prefix = `${year}-${String(m + 1).padStart(2, '0')}`;
      const monthExpenses = expenses.filter((e) => e.datum.startsWith(prefix));
      const monthIncomes = incomes.filter((i) => i.datum.startsWith(prefix));
      const einnahmen = monthIncomes.reduce((s, i) => s + i.betrag, 0);
      const ausgaben = monthExpenses.reduce((s, e) => s + e.betrag, 0);
      const saldo = einnahmen - ausgaben;
      const daysInMonth = new Date(year, m + 1, 0).getDate();

      data.push({
        month: m,
        label: getMonthName(m),
        einnahmen,
        ausgaben,
        saldo,
        sparquote: einnahmen > 0 ? (saldo / einnahmen) * 100 : 0,
        avgPerDay: ausgaben / daysInMonth,
        transactions: monthExpenses.length + monthIncomes.length,
      });
    }
    return data;
  }, [expenses, incomes]);

  const totals = useMemo(() => {
    const einnahmen = rows.reduce((s, r) => s + r.einnahmen, 0);
    const ausgaben = rows.reduce((s, r) => s + r.ausgaben, 0);
    const saldo = einnahmen - ausgaben;
    return {
      einnahmen,
      ausgaben,
      saldo,
      sparquote: einnahmen > 0 ? (saldo / einnahmen) * 100 : 0,
      transactions: rows.reduce((s, r) => s + r.transactions, 0),
    };
  }, [rows]);

  const chartData = rows
    .filter((r) => r.transactions > 0)
    .map((r) => ({ name: r.label.substring(0, 3), Einnahmen: r.einnahmen, Ausgaben: r.ausgaben }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Monatsübersicht {year}</h1>

      {/* Line Chart */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-slate-800">Verlauf</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
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

      {/* Table */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500 border-b border-slate-100">
                <th className="px-4 py-3 font-medium">Monat</th>
                <th className="px-4 py-3 font-medium text-right">Einnahmen</th>
                <th className="px-4 py-3 font-medium text-right">Ausgaben</th>
                <th className="px-4 py-3 font-medium text-right">Saldo</th>
                <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">Sparquote</th>
                <th className="hidden px-4 py-3 font-medium text-right md:table-cell">Ø/Tag</th>
                <th className="hidden px-4 py-3 font-medium text-right sm:table-cell">Txn</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${r.transactions === 0 ? 'opacity-35' : ''}`}>
                  <td className="px-4 py-3 font-medium text-slate-800">{r.label}</td>
                  <td className="px-4 py-3 text-right text-emerald-600 font-medium">{formatCurrency(r.einnahmen)}</td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">{formatCurrency(r.ausgaben)}</td>
                  <td className={`px-4 py-3 text-right font-bold ${r.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(r.saldo)}
                  </td>
                  <td className={`hidden px-4 py-3 text-right sm:table-cell font-medium ${r.sparquote >= 20 ? 'text-emerald-600' : r.sparquote >= 10 ? 'text-amber-500' : 'text-rose-600'}`}>
                    {r.transactions > 0 ? formatPercent(r.sparquote) : '–'}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-slate-500 md:table-cell">
                    {r.transactions > 0 ? formatCurrency(r.avgPerDay) : '–'}
                  </td>
                  <td className="hidden px-4 py-3 text-right text-slate-500 sm:table-cell">{r.transactions || '–'}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                <td className="px-4 py-3 text-slate-800">Gesamt</td>
                <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(totals.einnahmen)}</td>
                <td className="px-4 py-3 text-right text-rose-600">{formatCurrency(totals.ausgaben)}</td>
                <td className={`px-4 py-3 text-right ${totals.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(totals.saldo)}
                </td>
                <td className={`hidden px-4 py-3 text-right sm:table-cell ${totals.sparquote >= 20 ? 'text-emerald-600' : totals.sparquote >= 10 ? 'text-amber-500' : 'text-rose-600'}`}>
                  {formatPercent(totals.sparquote)}
                </td>
                <td className="hidden px-4 py-3 text-right text-slate-500 md:table-cell">–</td>
                <td className="hidden px-4 py-3 text-right text-slate-500 sm:table-cell">{totals.transactions}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useRef } from 'react';
import { Pencil, Trash2, Search, X, RefreshCw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, toInputDate } from '../utils/format';
import { useToast } from '../components/Toast';
import type { Expense } from '../types';

export function Ausgaben() {
  const { expenses, config, addExpense, updateExpense, deleteExpense } = useStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'datum' | 'betrag'>('datum');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formAusgabe, setFormAusgabe] = useState('');
  const [formBetrag, setFormBetrag] = useState('');
  const [formKonto, setFormKonto] = useState(config.konten[0] ?? '');
  const [formKategorie, setFormKategorie] = useState(config.ausgabenKategorien[0] ?? '');
  const [formDatum, setFormDatum] = useState(new Date().toISOString().split('T')[0]);
  const [formKommentar, setFormKommentar] = useState('');
  const [formRecurring, setFormRecurring] = useState(false);

  const touchStartX = useRef(0);
  const [swipedId, setSwipedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = expenses.filter(
      (e) =>
        e.ausgabe.toLowerCase().includes(search.toLowerCase()) ||
        e.kategorie.toLowerCase().includes(search.toLowerCase()) ||
        e.konto.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'datum') return mul * (new Date(a.datum).getTime() - new Date(b.datum).getTime());
      return mul * (a.betrag - b.betrag);
    });
    return list;
  }, [expenses, search, sortField, sortDir]);

  const handleAdd = () => {
    const betrag = parseFloat(formBetrag.replace(',', '.'));
    if (!formAusgabe || isNaN(betrag) || betrag <= 0) return;

    if (editingId !== null) {
      updateExpense(editingId, {
        ausgabe: formAusgabe, betrag, konto: formKonto,
        kategorie: formKategorie, datum: formDatum, kommentar: formKommentar,
        recurring: formRecurring,
      });
      showToast('Ausgabe aktualisiert');
      setEditingId(null);
    } else {
      addExpense({
        ausgabe: formAusgabe, betrag, konto: formKonto,
        kategorie: formKategorie, datum: formDatum, kommentar: formKommentar,
        recurring: formRecurring,
      });
      showToast('Ausgabe hinzugefügt');
    }
    resetForm();
  };

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setFormAusgabe(e.ausgabe);
    setFormBetrag(e.betrag.toString().replace('.', ','));
    setFormKonto(e.konto);
    setFormKategorie(e.kategorie);
    setFormDatum(toInputDate(e.datum));
    setFormKommentar(e.kommentar);
    setFormRecurring(e.recurring ?? false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormAusgabe('');
    setFormBetrag('');
    setFormKonto(config.konten[0] ?? '');
    setFormKategorie(config.ausgabenKategorien[0] ?? '');
    setFormDatum(new Date().toISOString().split('T')[0]);
    setFormKommentar('');
    setFormRecurring(false);
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    deleteExpense(id);
    showToast('Ausgabe gelöscht', 'error');
    setSwipedId(null);
  };

  const toggleSort = (field: 'datum' | 'betrag') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const handleTouchStart = (x: number) => { touchStartX.current = x; };
  const handleTouchEnd = (id: number, x: number) => {
    if (touchStartX.current - x > 80) setSwipedId(id);
    else setSwipedId(null);
  };

  const budgetMap = useMemo(() => {
    const map = new Map<string, number>();
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    expenses
      .filter((e) => e.datum.startsWith(currentMonth))
      .forEach((e) => map.set(e.kategorie, (map.get(e.kategorie) ?? 0) + e.betrag));
    return map;
  }, [expenses]);

  const inputClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";
  const selectClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Ausgaben</h1>

      {/* Budget Warnings */}
      {config.budgetLimits.length > 0 && (
        <div className="space-y-2">
          {config.budgetLimits.map((bl) => {
            const spent = budgetMap.get(bl.kategorie) ?? 0;
            const pct = Math.min((spent / bl.limit) * 100, 100);
            const over = spent > bl.limit;
            return (
              <div key={bl.kategorie} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">{bl.kategorie}</span>
                  <span className={over ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                    {formatCurrency(spent)} / {formatCurrency(bl.limit)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-rose-500' : pct > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">
          {editingId !== null ? 'Ausgabe bearbeiten' : 'Neue Ausgabe'}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input placeholder="Bezeichnung" value={formAusgabe} onChange={(e) => setFormAusgabe(e.target.value)} className={`col-span-2 sm:col-span-1 ${inputClass}`} />
          <input placeholder="Betrag" inputMode="decimal" value={formBetrag} onChange={(e) => setFormBetrag(e.target.value)} className={inputClass} />
          <select value={formKonto} onChange={(e) => setFormKonto(e.target.value)} className={selectClass}>
            {config.konten.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={formKategorie} onChange={(e) => setFormKategorie(e.target.value)} className={selectClass}>
            {config.ausgabenKategorien.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input type="date" value={formDatum} onChange={(e) => setFormDatum(e.target.value)} className={inputClass} />
          <input placeholder="Kommentar (optional)" value={formKommentar} onChange={(e) => setFormKommentar(e.target.value)} className={`col-span-2 sm:col-span-1 ${inputClass}`} />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-500">
            <input type="checkbox" checked={formRecurring} onChange={(e) => setFormRecurring(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <RefreshCw size={14} /> Wiederkehrend
          </label>
          <div className="ml-auto flex gap-2">
            {editingId !== null && (
              <button onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Abbrechen
              </button>
            )}
            <button onClick={handleAdd} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm">
              {editingId !== null ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => toggleSort('datum')} className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${sortField === 'datum' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
          Datum {sortField === 'datum' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => toggleSort('betrag')} className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${sortField === 'betrag' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
          Betrag {sortField === 'betrag' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((e) => (
          <div
            key={e.id}
            className={`flex items-center rounded-2xl bg-white p-4 shadow-sm border transition-all ${
              e.betrag > 100 ? 'border-rose-200' : 'border-slate-100'
            }`}
            onTouchStart={(ev) => handleTouchStart(ev.touches[0].clientX)}
            onTouchEnd={(ev) => handleTouchEnd(e.id, ev.changedTouches[0].clientX)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 shrink-0 ${
              e.betrag > 100 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
            }`}>
              <span className="text-lg">{e.kategorie.split(' ')[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-800 truncate">{e.ausgabe}</p>
                {e.recurring && <span className="text-[10px] font-medium text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">↻</span>}
              </div>
              <p className="text-xs text-slate-500">{e.kategorie} · {formatDate(e.datum)} · {e.konto}</p>
            </div>
            <p className={`ml-3 text-sm font-bold shrink-0 ${e.betrag > 100 ? 'text-rose-600' : 'text-slate-800'}`}>
              -{formatCurrency(e.betrag)}
            </p>
            <div className={`flex gap-0.5 ml-2 shrink-0 transition-opacity ${swipedId === e.id ? 'opacity-100' : ''}`}>
              <button onClick={() => startEdit(e)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(e.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center shadow-sm">
            <p className="text-sm text-slate-400">Keine Ausgaben gefunden</p>
          </div>
        )}
      </div>

      <p className="text-right text-sm text-slate-500">
        {filtered.length} Einträge · Gesamt: <span className="font-bold text-rose-600">{formatCurrency(filtered.reduce((s, e) => s + e.betrag, 0))}</span>
      </p>
    </div>
  );
}

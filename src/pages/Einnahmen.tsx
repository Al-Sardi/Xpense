import { useState, useMemo } from 'react';
import { Pencil, Trash2, Search, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate, toInputDate } from '../utils/format';
import { useToast } from '../components/Toast';
import type { Income } from '../types';

export function Einnahmen() {
  const { incomes, config, addIncome, updateIncome, deleteIncome } = useStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'datum' | 'betrag'>('datum');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formBezeichnung, setFormBezeichnung] = useState('');
  const [formBetrag, setFormBetrag] = useState('');
  const [formKonto, setFormKonto] = useState(config.konten[0] ?? '');
  const [formKategorie, setFormKategorie] = useState(config.einnahmenKategorien[0] ?? '');
  const [formDatum, setFormDatum] = useState(new Date().toISOString().split('T')[0]);
  const [formKommentar, setFormKommentar] = useState('');

  const filtered = useMemo(() => {
    const list = incomes.filter(
      (i) =>
        i.bezeichnung.toLowerCase().includes(search.toLowerCase()) ||
        i.kategorie.toLowerCase().includes(search.toLowerCase()) ||
        i.konto.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'datum') return mul * (new Date(a.datum).getTime() - new Date(b.datum).getTime());
      return mul * (a.betrag - b.betrag);
    });
    return list;
  }, [incomes, search, sortField, sortDir]);

  const handleAdd = () => {
    const betrag = parseFloat(formBetrag.replace(',', '.'));
    if (!formBezeichnung || isNaN(betrag) || betrag <= 0) return;

    if (editingId !== null) {
      updateIncome(editingId, {
        bezeichnung: formBezeichnung, betrag, konto: formKonto,
        kategorie: formKategorie, datum: formDatum, kommentar: formKommentar,
      });
      showToast('Einnahme aktualisiert');
      setEditingId(null);
    } else {
      addIncome({
        bezeichnung: formBezeichnung, betrag, konto: formKonto,
        kategorie: formKategorie, datum: formDatum, kommentar: formKommentar,
      });
      showToast('Einnahme hinzugefügt');
    }
    resetForm();
  };

  const startEdit = (i: Income) => {
    setEditingId(i.id);
    setFormBezeichnung(i.bezeichnung);
    setFormBetrag(i.betrag.toString().replace('.', ','));
    setFormKonto(i.konto);
    setFormKategorie(i.kategorie);
    setFormDatum(toInputDate(i.datum));
    setFormKommentar(i.kommentar);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormBezeichnung('');
    setFormBetrag('');
    setFormKonto(config.konten[0] ?? '');
    setFormKategorie(config.einnahmenKategorien[0] ?? '');
    setFormDatum(new Date().toISOString().split('T')[0]);
    setFormKommentar('');
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    deleteIncome(id);
    showToast('Einnahme gelöscht', 'error');
  };

  const toggleSort = (field: 'datum' | 'betrag') => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  const inputClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100";
  const selectClass = "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Einnahmen</h1>

      {/* Form */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-800">
          {editingId !== null ? 'Einnahme bearbeiten' : 'Neue Einnahme'}
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input placeholder="Bezeichnung" value={formBezeichnung} onChange={(e) => setFormBezeichnung(e.target.value)} className={`col-span-2 sm:col-span-1 ${inputClass}`} />
          <input placeholder="Betrag" inputMode="decimal" value={formBetrag} onChange={(e) => setFormBetrag(e.target.value)} className={inputClass} />
          <select value={formKonto} onChange={(e) => setFormKonto(e.target.value)} className={selectClass}>
            {config.konten.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <select value={formKategorie} onChange={(e) => setFormKategorie(e.target.value)} className={selectClass}>
            {config.einnahmenKategorien.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
          <input type="date" value={formDatum} onChange={(e) => setFormDatum(e.target.value)} className={inputClass} />
          <input placeholder="Kommentar (optional)" value={formKommentar} onChange={(e) => setFormKommentar(e.target.value)} className={`col-span-2 sm:col-span-1 ${inputClass}`} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {editingId !== null && (
            <button onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              Abbrechen
            </button>
          )}
          <button onClick={handleAdd} className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm">
            {editingId !== null ? 'Aktualisieren' : 'Hinzufügen'}
          </button>
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
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 shadow-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}
        </div>
        <button onClick={() => toggleSort('datum')} className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${sortField === 'datum' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
          Datum {sortField === 'datum' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
        <button onClick={() => toggleSort('betrag')} className={`rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${sortField === 'betrag' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
          Betrag {sortField === 'betrag' && (sortDir === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((inc) => (
          <div key={inc.id} className="flex items-center rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mr-3 shrink-0">
              <span className="text-lg">{inc.kategorie.split(' ')[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{inc.bezeichnung}</p>
              <p className="text-xs text-slate-500">{inc.kategorie} · {formatDate(inc.datum)} · {inc.konto}</p>
            </div>
            <p className="ml-3 text-sm font-bold text-emerald-600 shrink-0">+{formatCurrency(inc.betrag)}</p>
            <div className="flex gap-0.5 ml-2 shrink-0">
              <button onClick={() => startEdit(inc)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(inc.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-100 bg-white py-12 text-center shadow-sm">
            <p className="text-sm text-slate-400">Keine Einnahmen gefunden</p>
          </div>
        )}
      </div>

      <p className="text-right text-sm text-slate-500">
        {filtered.length} Einträge · Gesamt: <span className="font-bold text-emerald-600">{formatCurrency(filtered.reduce((s, i) => s + i.betrag, 0))}</span>
      </p>
    </div>
  );
}

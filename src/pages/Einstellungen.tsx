import { useState, useRef } from 'react';
import { Plus, Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/Toast';
import { formatCurrency } from '../utils/format';

export function Einstellungen() {
  const store = useStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [newKonto, setNewKonto] = useState('');
  const [newAusgabenKat, setNewAusgabenKat] = useState('');
  const [newEinnahmenKat, setNewEinnahmenKat] = useState('');
  const [budgetKategorie, setBudgetKategorie] = useState(store.config.ausgabenKategorien[0] ?? '');
  const [budgetLimit, setBudgetLimit] = useState('');

  const handleExport = () => {
    const json = store.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xpense-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Daten exportiert');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        store.importData(ev.target?.result as string);
        showToast('Daten importiert');
      } catch {
        showToast('Import fehlgeschlagen', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    store.resetData();
    setShowResetConfirm(false);
    showToast('Alle Daten zurückgesetzt', 'error');
  };

  const handleAddBudget = () => {
    const limit = parseFloat(budgetLimit.replace(',', '.'));
    if (!budgetKategorie || isNaN(limit) || limit <= 0) return;
    store.setBudgetLimit(budgetKategorie, limit);
    setBudgetLimit('');
    showToast('Budget-Limit gesetzt');
  };

  const inputClass = "flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>

      {/* Konten */}
      <Section title="Konten">
        <div className="space-y-2">
          {store.config.konten.map((k) => (
            <div key={k} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
              <span className="text-sm font-medium text-slate-700">{k}</span>
              <button onClick={() => { store.removeKonto(k); showToast('Konto entfernt', 'error'); }} className="text-slate-400 hover:text-rose-500 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="Neues Konto"
            value={newKonto}
            onChange={(e) => setNewKonto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newKonto.trim()) { store.addKonto(newKonto.trim()); setNewKonto(''); showToast('Konto hinzugefügt'); } }}
            className={inputClass}
          />
          <button
            onClick={() => { if (newKonto.trim()) { store.addKonto(newKonto.trim()); setNewKonto(''); showToast('Konto hinzugefügt'); } }}
            className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </Section>

      {/* Ausgaben-Kategorien */}
      <Section title="Ausgaben-Kategorien">
        <div className="flex flex-wrap gap-2">
          {store.config.ausgabenKategorien.map((k) => (
            <span key={k} className="flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700">
              {k}
              <button onClick={() => { store.removeAusgabenKategorie(k); showToast('Kategorie entfernt', 'error'); }} className="text-slate-400 hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="z.B. 🎮 Gaming"
            value={newAusgabenKat}
            onChange={(e) => setNewAusgabenKat(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newAusgabenKat.trim()) { store.addAusgabenKategorie(newAusgabenKat.trim()); setNewAusgabenKat(''); showToast('Kategorie hinzugefügt'); } }}
            className={inputClass}
          />
          <button
            onClick={() => { if (newAusgabenKat.trim()) { store.addAusgabenKategorie(newAusgabenKat.trim()); setNewAusgabenKat(''); showToast('Kategorie hinzugefügt'); } }}
            className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </Section>

      {/* Einnahmen-Kategorien */}
      <Section title="Einnahmen-Kategorien">
        <div className="flex flex-wrap gap-2">
          {store.config.einnahmenKategorien.map((k) => (
            <span key={k} className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm font-medium text-emerald-700">
              {k}
              <button onClick={() => { store.removeEinnahmenKategorie(k); showToast('Kategorie entfernt', 'error'); }} className="text-emerald-400 hover:text-rose-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="z.B. 🎁 Bonus"
            value={newEinnahmenKat}
            onChange={(e) => setNewEinnahmenKat(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newEinnahmenKat.trim()) { store.addEinnahmenKategorie(newEinnahmenKat.trim()); setNewEinnahmenKat(''); showToast('Kategorie hinzugefügt'); } }}
            className={inputClass}
          />
          <button
            onClick={() => { if (newEinnahmenKat.trim()) { store.addEinnahmenKategorie(newEinnahmenKat.trim()); setNewEinnahmenKat(''); showToast('Kategorie hinzugefügt'); } }}
            className="rounded-xl bg-emerald-600 p-2.5 text-white hover:bg-emerald-700 shadow-sm"
          >
            <Plus size={18} />
          </button>
        </div>
      </Section>

      {/* Budget Limits */}
      <Section title="Budget-Limits (pro Monat)">
        {store.config.budgetLimits.length > 0 && (
          <div className="mb-3 space-y-2">
            {store.config.budgetLimits.map((bl) => (
              <div key={bl.kategorie} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                <span className="text-sm font-medium text-slate-700">{bl.kategorie}: <span className="text-indigo-600">{formatCurrency(bl.limit)}</span></span>
                <button onClick={() => { store.removeBudgetLimit(bl.kategorie); showToast('Limit entfernt', 'error'); }} className="text-slate-400 hover:text-rose-500">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <select
            value={budgetKategorie}
            onChange={(e) => setBudgetKategorie(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          >
            {store.config.ausgabenKategorien.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input
            placeholder="Limit €"
            inputMode="decimal"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
            className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
          />
          <button onClick={handleAddBudget} className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 shadow-sm">
            <Plus size={18} />
          </button>
        </div>
      </Section>

      {/* Data Management */}
      <Section title="Daten verwalten">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-colors">
            <Download size={16} /> JSON exportieren
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 shadow-sm transition-colors">
            <Upload size={16} /> JSON importieren
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={() => setShowResetConfirm(true)} className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-5 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-colors">
            <AlertTriangle size={16} /> Zurücksetzen
          </button>
        </div>
      </Section>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="mb-4 flex items-center gap-3 text-rose-600">
              <div className="rounded-full bg-rose-100 p-2">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Daten zurücksetzen?</h3>
            </div>
            <p className="mb-6 text-sm text-slate-600 leading-relaxed">
              Alle Ausgaben, Einnahmen und Einstellungen werden unwiderruflich gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Abbrechen
              </button>
              <button onClick={handleReset} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700">
                Alles löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

import { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from './Toast';

interface Props {
  open: boolean;
  onClose: () => void;
  onGoToExpenses: () => void;
}

export function QuickAddModal({ open, onClose }: Props) {
  const { config, addExpense } = useStore();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [betrag, setBetrag] = useState('');
  const [kategorie, setKategorie] = useState('');

  if (!open) return null;

  const handleSave = () => {
    const amount = parseFloat(betrag.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    addExpense({
      ausgabe: kategorie,
      betrag: amount,
      konto: config.konten[0] ?? '',
      kategorie,
      datum: new Date().toISOString().split('T')[0],
      kommentar: '',
    });
    showToast('Ausgabe hinzugefügt');
    setBetrag('');
    setKategorie('');
    setStep(1);
    onClose();
  };

  const reset = () => {
    setBetrag('');
    setKategorie('');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm" onClick={reset}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Schnell hinzufügen</h3>
          <button onClick={reset} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {step === 1 ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-500">Betrag (€)</label>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={betrag}
              onChange={(e) => setBetrag(e.target.value)}
              placeholder="0,00"
              className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-2xl font-bold text-slate-900 placeholder-slate-300 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={() => { if (betrag) setStep(2); }}
              disabled={!betrag}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
            >
              Weiter
            </button>
          </div>
        ) : (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-500">Kategorie wählen</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {config.ausgabenKategorien.map((kat) => (
                <button
                  key={kat}
                  onClick={() => setKategorie(kat)}
                  className={`rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    kategorie === kat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
            <button
              onClick={handleSave}
              disabled={!kategorie}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
            >
              Speichern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

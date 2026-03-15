import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Expense, Income } from '../types';

const defaultConfig = {
  konten: ['Giro S', 'Credit Suisse'],
  ausgabenKategorien: ['🍔 Essen', '🛒 Einkauf', '🏠 Miete', '🚘 Auto', '⚽️ Wellbeing', '📈 Investment', 'N/A'],
  einnahmenKategorien: ['🏦 Gehalt', '💰 TG', '💸 Zuschuss'],
  budgetLimits: [],
};

const sampleExpenses: Expense[] = [
  { id: 1, ausgabe: 'Döner', betrag: 8.5, konto: 'Giro S', kategorie: '🍔 Essen', datum: '2026-02-08', kommentar: '' },
  { id: 2, ausgabe: 'Schokobrötchen', betrag: 1.6, konto: 'Giro S', kategorie: '🍔 Essen', datum: '2026-02-06', kommentar: '' },
  { id: 3, ausgabe: 'Parfüm TH', betrag: 29.9, konto: 'Giro S', kategorie: '🛒 Einkauf', datum: '2026-02-04', kommentar: '' },
  { id: 4, ausgabe: 'Miete Feb', betrag: 400, konto: 'Giro S', kategorie: '🏠 Miete', datum: '2026-01-28', kommentar: '' },
  { id: 5, ausgabe: 'Gym Abo', betrag: 18.8, konto: 'Giro S', kategorie: '⚽️ Wellbeing', datum: '2026-01-29', kommentar: '' },
  { id: 6, ausgabe: 'Friseur', betrag: 15, konto: 'Giro S', kategorie: 'N/A', datum: '2026-02-08', kommentar: '' },
  { id: 7, ausgabe: 'Tanken 20l', betrag: 30, konto: 'Credit Suisse', kategorie: '🚘 Auto', datum: '2026-02-09', kommentar: '' },
  { id: 8, ausgabe: 'Bitcoin', betrag: 700, konto: 'Credit Suisse', kategorie: '📈 Investment', datum: '2026-02-01', kommentar: '' },
];

const sampleIncomes: Income[] = [
  { id: 1, bezeichnung: 'Gehalt Feb', betrag: 1150.75, konto: 'Giro S', kategorie: '🏦 Gehalt', datum: '2026-02-08', kommentar: '' },
  { id: 2, bezeichnung: 'Tagesgeld Zinsen', betrag: 50, konto: 'Giro S', kategorie: '💰 TG', datum: '2026-02-06', kommentar: '' },
  { id: 3, bezeichnung: 'Wohnkostenzuschuss', betrag: 400, konto: 'Giro S', kategorie: '💸 Zuschuss', datum: '2026-02-01', kommentar: '' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      expenses: sampleExpenses,
      incomes: sampleIncomes,
      config: defaultConfig,
      nextExpenseId: 9,
      nextIncomeId: 4,

      addExpense: (expense) =>
        set((state) => ({
          expenses: [...state.expenses, { ...expense, id: state.nextExpenseId }],
          nextExpenseId: state.nextExpenseId + 1,
        })),

      updateExpense: (id, data) =>
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...data } : e)),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addIncome: (income) =>
        set((state) => ({
          incomes: [...state.incomes, { ...income, id: state.nextIncomeId }],
          nextIncomeId: state.nextIncomeId + 1,
        })),

      updateIncome: (id, data) =>
        set((state) => ({
          incomes: state.incomes.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),

      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        })),

      addKonto: (konto) =>
        set((state) => ({
          config: { ...state.config, konten: [...state.config.konten, konto] },
        })),

      removeKonto: (konto) =>
        set((state) => ({
          config: { ...state.config, konten: state.config.konten.filter((k) => k !== konto) },
        })),

      addAusgabenKategorie: (kat) =>
        set((state) => ({
          config: { ...state.config, ausgabenKategorien: [...state.config.ausgabenKategorien, kat] },
        })),

      removeAusgabenKategorie: (kat) =>
        set((state) => ({
          config: { ...state.config, ausgabenKategorien: state.config.ausgabenKategorien.filter((k) => k !== kat) },
        })),

      addEinnahmenKategorie: (kat) =>
        set((state) => ({
          config: { ...state.config, einnahmenKategorien: [...state.config.einnahmenKategorien, kat] },
        })),

      removeEinnahmenKategorie: (kat) =>
        set((state) => ({
          config: { ...state.config, einnahmenKategorien: state.config.einnahmenKategorien.filter((k) => k !== kat) },
        })),

      setBudgetLimit: (kategorie, limit) =>
        set((state) => {
          const existing = state.config.budgetLimits.find((b) => b.kategorie === kategorie);
          const budgetLimits = existing
            ? state.config.budgetLimits.map((b) => (b.kategorie === kategorie ? { ...b, limit } : b))
            : [...state.config.budgetLimits, { kategorie, limit }];
          return { config: { ...state.config, budgetLimits } };
        }),

      removeBudgetLimit: (kategorie) =>
        set((state) => ({
          config: {
            ...state.config,
            budgetLimits: state.config.budgetLimits.filter((b) => b.kategorie !== kategorie),
          },
        })),

      exportData: () => {
        const state = get();
        return JSON.stringify({
          expenses: state.expenses,
          incomes: state.incomes,
          config: state.config,
          nextExpenseId: state.nextExpenseId,
          nextIncomeId: state.nextIncomeId,
        }, null, 2);
      },

      importData: (json) => {
        const data = JSON.parse(json);
        set({
          expenses: data.expenses ?? [],
          incomes: data.incomes ?? [],
          config: data.config ?? defaultConfig,
          nextExpenseId: data.nextExpenseId ?? 1,
          nextIncomeId: data.nextIncomeId ?? 1,
        });
      },

      resetData: () =>
        set({
          expenses: [],
          incomes: [],
          config: defaultConfig,
          nextExpenseId: 1,
          nextIncomeId: 1,
        }),
    }),
    { name: 'xpense-storage' }
  )
);

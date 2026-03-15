export interface Expense {
  id: number;
  ausgabe: string;
  betrag: number;
  konto: string;
  kategorie: string;
  datum: string; // ISO string
  kommentar: string;
  recurring?: boolean;
}

export interface Income {
  id: number;
  bezeichnung: string;
  betrag: number;
  konto: string;
  kategorie: string;
  datum: string; // ISO string
  kommentar: string;
}

export interface BudgetLimit {
  kategorie: string;
  limit: number;
}

export interface AppConfig {
  konten: string[];
  ausgabenKategorien: string[];
  einnahmenKategorien: string[];
  budgetLimits: BudgetLimit[];
}

export interface AppState {
  expenses: Expense[];
  incomes: Income[];
  config: AppConfig;
  nextExpenseId: number;
  nextIncomeId: number;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: number, expense: Partial<Expense>) => void;
  deleteExpense: (id: number) => void;

  addIncome: (income: Omit<Income, 'id'>) => void;
  updateIncome: (id: number, income: Partial<Income>) => void;
  deleteIncome: (id: number) => void;

  addKonto: (konto: string) => void;
  removeKonto: (konto: string) => void;
  addAusgabenKategorie: (kat: string) => void;
  removeAusgabenKategorie: (kat: string) => void;
  addEinnahmenKategorie: (kat: string) => void;
  removeEinnahmenKategorie: (kat: string) => void;

  setBudgetLimit: (kategorie: string, limit: number) => void;
  removeBudgetLimit: (kategorie: string) => void;

  exportData: () => string;
  importData: (json: string) => void;
  resetData: () => void;
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, TrendingUp, Settings, Plus, Wallet } from 'lucide-react';
import { useState } from 'react';
import { QuickAddModal } from './QuickAddModal';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/ausgaben', icon: Receipt, label: 'Ausgaben' },
  { to: '/einnahmen', icon: TrendingUp, label: 'Einnahmen' },
  { to: '/einstellungen', icon: Settings, label: 'Settings' },
];

export function Layout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-4xl flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Wallet size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight">Xpense</span>
          </div>
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 md:pb-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Bottom Navigation — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg items-end justify-around py-1.5">
          {navItems.slice(0, 2).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}

          {/* Center FAB in tab bar */}
          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex flex-col items-center gap-0.5 -mt-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95">
              <Plus size={24} />
            </div>
            <span className="text-[11px] font-medium text-indigo-600">Neu</span>
          </button>

          {navItems.slice(2).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onGoToExpenses={() => {
          setQuickAddOpen(false);
          navigate('/ausgaben');
        }}
      />
    </div>
  );
}

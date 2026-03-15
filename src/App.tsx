import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { Ausgaben } from './pages/Ausgaben';
import { Einnahmen } from './pages/Einnahmen';
import { Einstellungen } from './pages/Einstellungen';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ausgaben" element={<Ausgaben />} />
            <Route path="/einnahmen" element={<Einnahmen />} />
            <Route path="/einstellungen" element={<Einstellungen />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

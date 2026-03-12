import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useFinancialStore } from './store/useFinancialStore';
import { Layout } from './components/layout/Layout';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { Dashboard } from './pages/Dashboard';
import { Budget } from './pages/Budget';
import { Debts } from './pages/Debts';
import { Goals } from './pages/Goals';
import { BiweeklyPlan } from './pages/BiweeklyPlan';
import { EmergencyFund } from './pages/EmergencyFund';
import { Transactions } from './pages/Transactions';
import { Insights } from './pages/Insights';
import { Settings } from './pages/Settings';

function AppRoutes() {
  const { onboardingCompleted } = useFinancialStore();

  if (!onboardingCompleted) {
    return <OnboardingWizard />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/presupuesto" element={<Budget />} />
        <Route path="/deudas" element={<Debts />} />
        <Route path="/metas" element={<Goals />} />
        <Route path="/quincenal" element={<BiweeklyPlan />} />
        <Route path="/emergencia" element={<EmergencyFund />} />
        <Route path="/transacciones" element={<Transactions />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/configuracion" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layout/app-layout.tsx';
import { JobsPage } from './pages/jobs-page.tsx';
import { DashboardPage } from './pages/dashboard-page.tsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<JobsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}

export default App;

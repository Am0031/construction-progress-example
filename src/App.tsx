import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import GanttPage from './pages/GanttPage';
import ResourcesPage from './pages/ResourcesPage';
import RiskRegisterPage from './pages/RiskRegisterPage';
import ReportPage from './pages/ReportPage';
import AssistantPage from './pages/AssistantPage';

const App = () => {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen flex-col bg-slate-100">
        <Navbar />
        <main className="flex min-h-0 flex-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/programme" element={<GanttPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/risks" element={<RiskRegisterPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

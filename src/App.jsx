import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Knowledge from './pages/Knowledge';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import CaseStudy from './pages/CaseStudy';

function AppLayout() {
  const location = useLocation();
  const hideNav = (location.pathname.startsWith('/knowledge/') && location.pathname !== '/knowledge') ||
                   location.pathname === '/cases';

  return (
    <div className="min-h-full bg-sigma-dark">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/knowledge/:id?" element={<Knowledge />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cases" element={<CaseStudy />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/sigma-green">
      <AppLayout />
    </BrowserRouter>
  );
}

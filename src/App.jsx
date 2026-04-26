import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Problems from './pages/Problems';
import Community from './pages/Community/Community';
import Arena from './pages/Community/Arena';
import Diagnostic from './pages/Community/Diagnostic';
import ProblemSearch from './pages/Community/ProblemSearch';
import CreateProblem from './pages/Community/CreateProblem';
import SavedProblems from './pages/Community/SavedProblems';
import News from './pages/News';
import Courses from './pages/Courses';
import Leaderboard from './pages/Leaderboard';
import Shop from './pages/Shop';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

function RequireAuth({ children }) {
  const { token, authLoading } = useApp();
  const location = useLocation();
  if (authLoading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    );
  }
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-fade">
      <Routes location={location}>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about"    element={<About />} />

        {/* Protected */}
        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/problems" element={<RequireAuth><Problems /></RequireAuth>} />
        <Route path="/community" element={<RequireAuth><Community /></RequireAuth>}>
          <Route path="arena"      element={<Arena />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="search"     element={<ProblemSearch />} />
          <Route path="create"     element={<CreateProblem />} />
          <Route path="saved"      element={<SavedProblems />} />
        </Route>
        <Route path="/news"         element={<RequireAuth><News /></RequireAuth>} />
        <Route path="/courses"      element={<RequireAuth><Courses /></RequireAuth>} />
        <Route path="/leaderboard"  element={<RequireAuth><Leaderboard /></RequireAuth>} />
        <Route path="/shop"         element={<RequireAuth><Shop /></RequireAuth>} />
        <Route path="/profile/:username" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/settings"     element={<RequireAuth><Settings /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Layout() {
  const { token } = useApp();
  return (
    <>
      {token && <Navbar />}
      <AnimatedRoutes />
      {token && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Layout />
      </AppProvider>
    </BrowserRouter>
  );
}

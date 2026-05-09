import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { useStore } from './stores/useStore';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Learning from './pages/Learning';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Achievements from './pages/Achievements';
import Login from './pages/Login';
import Register from './pages/Register';

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <Sidebar />
      <main className="lg:ml-64 min-h-screen">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function App() {
  const { isAuthenticated } = useStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/learn/:type" element={<Learning />} />
                <Route path="/community" element={<Community />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/achievements" element={<Achievements />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

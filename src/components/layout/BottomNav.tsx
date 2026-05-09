import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Users,
  Trophy,
  GraduationCap,
  Mic,
  Headphones
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/courses', icon: BookOpen, label: '课程' },
  { path: '/community', icon: Users, label: '社区' },
  { path: '/achievements', icon: Trophy, label: '成就' }
];

const learnItems = [
  { path: '/learn/vocabulary', icon: GraduationCap, label: '背单词' },
  { path: '/learn/speaking', icon: Mic, label: '口语' },
  { path: '/learn/listening', icon: Headphones, label: '听力' }
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                isActive ? 'text-violet-400' : 'text-slate-400'
              }`}
            >
              <item.icon size={22} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

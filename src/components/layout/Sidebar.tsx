import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Users,
  Trophy,
  Settings,
  HelpCircle,
  GraduationCap,
  Mic,
  Headphones
} from 'lucide-react';
import { useStore } from '../../stores/useStore';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/courses', icon: BookOpen, label: '课程中心' },
  { path: '/learn/vocabulary', icon: GraduationCap, label: '背单词' },
  { path: '/learn/speaking', icon: Mic, label: '口语练习' },
  { path: '/learn/listening', icon: Headphones, label: '听力训练' },
  { path: '/community', icon: Users, label: '社区' },
  { path: '/achievements', icon: Trophy, label: '成就' }
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useStore();

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 hidden lg:block overflow-y-auto">
      <div className="p-4">
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 border border-violet-500/20">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Learner'}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-violet-500"
            />
            <div>
              <p className="font-medium text-white">{user?.nickname || '游客'}</p>
              <p className="text-xs text-slate-400">Lv.{user?.level || 1}</p>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((user?.exp || 0) % 100)}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {user?.exp || 0} / {(user?.level || 1) * 100} 经验值
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-slate-800">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <HelpCircle size={20} />
              <span>帮助与反馈</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <Settings size={20} />
              <span>设置</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

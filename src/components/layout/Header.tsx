import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '../../stores/useStore';
import {
  Globe,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Badge } from '../common/Badge';

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'ja' as const, name: '日本語', flag: '🇯🇵' },
  { code: 'ko' as const, name: '한국어', flag: '🇰🇷' }
];

export function Header() {
  const location = useLocation();
  const { user, isAuthenticated, logout, currentLanguage, setCurrentLanguage } = useStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const currentLang = languages.find((l) => l.code === currentLanguage);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              LinguaWorld
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { path: '/', label: '首页' },
            { path: '/courses', label: '课程' },
            { path: '/community', label: '社区' },
            { path: '/achievements', label: '成就' }
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-violet-600/20 text-violet-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-300 hover:border-slate-600 transition-colors"
            >
              <span>{currentLang?.flag}</span>
              <span className="hidden sm:inline">{currentLang?.name}</span>
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-violet-600/20 text-violet-400'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {isAuthenticated ? (
            <>
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.nickname}
                    className="w-9 h-9 rounded-full border-2 border-violet-500/50"
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-700">
                        <p className="font-medium text-white">{user?.nickname}</p>
                        <p className="text-sm text-slate-400">{user?.email}</p>
                        <Badge variant="info" className="mt-2">
                          Lv.{user?.level}
                        </Badge>
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <User size={16} />
                          个人资料
                        </Link>
                        <Link
                          to="/achievements"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                        >
                          <Badge variant="warning" size="sm">🏆</Badge>
                          我的成就
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-slate-700"
                        >
                          <LogOut size={16} />
                          退出登录
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-slate-900 border-t border-slate-800 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {[
                { path: '/', label: '首页' },
                { path: '/courses', label: '课程' },
                { path: '/community', label: '社区' },
                { path: '/achievements', label: '成就' }
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-violet-600/20 text-violet-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Trophy, BookOpen, User } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Terminal, label: 'Arena' },
    { path: '/learn', icon: BookOpen, label: 'Academy' },
    { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  ];

  return (
    <div className="min-h-screen bg-sql-dark text-slate-300 flex flex-col font-sans selection:bg-sql-accent selection:text-white">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-sql-dark/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="font-mono font-bold text-white text-lg">{`{}`}</span>
              </div>
              <span className="font-bold text-xl text-white tracking-tight hidden sm:block">
                SQL<span className="text-blue-400">Arena</span>
              </span>
            </div>
            
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      
      <footer className="border-t border-slate-800 mt-auto bg-slate-900/50">
        <div className="max-w-7xl mx-auto py-6 px-4 text-center text-slate-500 text-sm">
          <p>Built for the Class of '26 • Powered by Gemini AI</p>
        </div>
      </footer>
    </div>
  );
};
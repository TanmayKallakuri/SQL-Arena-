import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Difficulty, UserProfile } from '../types';
import { ArrowRight, Database, ShieldCheck, Zap, Trophy, RotateCcw, Play } from 'lucide-react';

interface HomeProps {
  userProfile: UserProfile;
  setUserProfile: (name: string, difficulty: Difficulty) => void;
  onReset: () => void;
}

export const Home: React.FC<HomeProps> = ({ userProfile, setUserProfile, onReset }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.INTERMEDIATE);

  // Pre-fill if partial data exists or strictly use props
  useEffect(() => {
    if (userProfile.name) {
        setName(userProfile.name);
        setDifficulty(userProfile.selectedDifficulty);
    }
  }, [userProfile]);

  const handleStart = () => {
    if (!name.trim()) return;
    setUserProfile(name, difficulty);
    navigate('/learn');
  };

  const handleContinue = () => {
      navigate('/learn');
  };

  // Render "Welcome Back" Screen if already logged in
  if (userProfile.name) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
                <h1 className="text-5xl font-extrabold text-white">
                    Welcome Back, <span className="text-blue-400">{userProfile.name}</span>
                </h1>
                <p className="text-xl text-slate-400">
                    Current Score: <span className="text-green-400 font-mono">{userProfile.currentScore} XP</span>
                </p>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={handleContinue}
                    className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20 transform hover:scale-105"
                >
                    <Play className="w-6 h-6 mr-2 fill-current" />
                    Continue Session
                </button>
                
                <button
                    onClick={onReset}
                    className="flex items-center bg-slate-800 hover:bg-red-900/20 hover:text-red-400 text-slate-400 px-8 py-4 rounded-xl font-bold text-lg transition-all border border-slate-700"
                >
                    <RotateCcw className="w-6 h-6 mr-2" />
                    Reset Profile
                </button>
            </div>
        </div>
      );
  }

  // Standard Landing Page
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-fade-in">
      
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-4">
          <Zap className="w-3 h-3 mr-1" /> Exam Prep Mode Active
        </div>
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white">
          SQL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Arena</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Master Joins, Window Functions, and Query Optimization with AI-generated challenges tailored to your skill level.
        </p>
      </div>

      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="space-y-6">
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-300 mb-2">Cadet Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name for the leaderboard"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="text-left">
            <label className="block text-sm font-medium text-slate-300 mb-2">Current Skill Level</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(Difficulty).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    difficulty === diff
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!name.trim()}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
              name.trim()
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Enter the Arena</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-slate-400">
        <div className="flex flex-col items-center space-y-2">
          <Database className="w-6 h-6 text-emerald-400" />
          <span className="text-sm font-medium">Deep Dive Scenarios</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <ShieldCheck className="w-6 h-6 text-blue-400" />
          <span className="text-sm font-medium">Real-time Grading</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <span className="text-sm font-medium">Class Leaderboard</span>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { MOCK_LEADERBOARD } from '../constants';
import { UserProfile, LeaderboardEntry } from '../types';
import { Trophy, Medal, Crown, Info } from 'lucide-react';

interface LeaderboardProps {
  currentUser: UserProfile;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  // Merge current user into mock leaderboard for display
  const allEntries: LeaderboardEntry[] = [
    ...MOCK_LEADERBOARD,
    { 
        name: currentUser.name || 'You', 
        score: currentUser.currentScore, 
        rank: 0, 
        badges: currentUser.currentScore > 1000 ? ['Rising Star'] : [] 
    }
  ].sort((a, b) => b.score - a.score)
   .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          Hall of Fame
        </h2>
        <p className="text-slate-400">Compete against the class of '25</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        <div className="grid grid-cols-12 bg-slate-900/80 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Cadet</div>
            <div className="col-span-3 text-right">Score</div>
            <div className="col-span-2 text-center">Badges</div>
        </div>

        <div className="divide-y divide-slate-700/50">
          {allEntries.map((entry) => {
            const isCurrentUser = entry.name === (currentUser.name || 'You');
            
            return (
              <div 
                key={entry.rank} 
                className={`grid grid-cols-12 p-4 items-center transition-colors hover:bg-slate-700/30 ${
                    isCurrentUser ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="col-span-2 flex justify-center">
                    {entry.rank === 1 && <Crown className="w-6 h-6 text-yellow-400 fill-current" />}
                    {entry.rank === 2 && <Medal className="w-6 h-6 text-slate-300" />}
                    {entry.rank === 3 && <Medal className="w-6 h-6 text-amber-600" />}
                    {entry.rank > 3 && <span className="text-slate-400 font-mono font-bold">#{entry.rank}</span>}
                </div>
                
                <div className="col-span-5 font-bold text-slate-200 flex items-center gap-2">
                    {entry.name}
                    {isCurrentUser && <span className="text-xs bg-blue-500 text-white px-1.5 rounded">YOU</span>}
                </div>
                
                <div className="col-span-3 text-right font-mono text-blue-400">
                    {entry.score.toLocaleString()}
                </div>

                <div className="col-span-2 flex justify-center gap-1">
                    {entry.badges.map((b, i) => (
                        <span key={i} title={b} className="w-2 h-2 rounded-full bg-purple-500"></span>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-6 flex items-start gap-3 p-4 bg-blue-900/10 border border-blue-500/20 rounded-lg">
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-200/80">
            <p className="font-bold mb-1 text-blue-300">How this works:</p>
            <p>
                Your progress is currently saved to your local device. 
                Global synchronization with the rest of the Class of '26 requires a backend database connection. 
                For now, you are competing against historical class benchmarks!
            </p>
        </div>
    </div>
    </div>
  );
};
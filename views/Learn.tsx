import React from 'react';
import { Link } from 'react-router-dom';
import { TOPICS } from '../constants';
import * as Icons from 'lucide-react';

export const Learn: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">SQL Knowledge Base</h2>
          <p className="text-slate-400">Select a topic to study or take a specific quiz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TOPICS.map((topic) => {
          // Dynamically resolve icon
          const IconComponent = (Icons as any)[topic.icon] || Icons.Database;

          return (
            <div key={topic.id} className="group relative bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800 transition-all duration-300 hover:border-blue-500/50 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <IconComponent className="w-24 h-24 text-blue-500" />
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                  <IconComponent className="w-6 h-6 text-blue-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{topic.title}</h3>
                <p className="text-slate-400 text-sm mb-4 h-10">{topic.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {topic.keyConcepts.slice(0, 3).map(concept => (
                    <span key={concept} className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-500 border border-slate-800">
                      {concept}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                   <Link 
                    to={`/learn/${topic.id}`}
                    className="flex-1 text-center bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Study Theory
                  </Link>
                  <Link 
                    to={`/quiz/${topic.id}`}
                    className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-900/20"
                  >
                    Start Quiz
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
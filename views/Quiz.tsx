
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateQuizQuestion, evaluateSubmission } from '../services/geminiService';
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile } from '../types';
import { Loader2, Play, HelpCircle, CheckCircle, XCircle, TrendingUp, Activity, BookOpen, Code2, Zap, LayoutTemplate, Terminal } from 'lucide-react';

interface QuizProps {
  userProfile: UserProfile;
  updateScore: (points: number) => void;
  updateDifficulty: (diff: Difficulty) => void;
}

export const Quiz: React.FC<QuizProps> = ({ userProfile, updateScore, updateDifficulty }) => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Determine difficulty locally or from profile
  const currentDifficulty = userProfile.selectedDifficulty;

  const loadNewQuestion = useCallback(async () => {
    setLoading(true);
    setResult(null);
    setUserQuery('');
    setShowHint(false);
    
    const newQ = await generateQuizQuestion(topicId || 'SQL General', currentDifficulty);
    setQuestion(newQ);
    setLoading(false);
  }, [topicId, currentDifficulty]);

  // Initial load
  useEffect(() => {
    loadNewQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!question || !userQuery.trim()) return;
    setEvaluating(true);
    const evaluation = await evaluateSubmission(question, userQuery);
    setResult(evaluation);
    
    if (evaluation.isCorrect) {
      updateScore(evaluation.scoreAwarded);
    }
    
    setEvaluating(false);
  };

  const handleIncreaseDifficulty = () => {
      // Logic to bump difficulty
      const levels = Object.values(Difficulty);
      const idx = levels.indexOf(currentDifficulty);
      if (idx < levels.length - 1) {
          updateDifficulty(levels[idx + 1]);
          // Trigger reload in effect or manually
          setTimeout(() => loadNewQuestion(), 100);
      }
  };

  // Determine text area styling based on result state
  const getEditorStyles = () => {
      if (evaluating) return "border-blue-500/50 ring-1 ring-blue-500/30";
      if (!result) return "border-slate-700 focus:border-blue-500";
      return result.isCorrect 
        ? "border-green-500 ring-1 ring-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
        : "border-red-500 ring-1 ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
  };

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Summoning Challenge...</h2>
        <p className="text-slate-500 text-sm">Accessing Static Question Bank</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[80vh]">
      {/* LEFT COLUMN: Question & Context (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col h-full space-y-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col h-full shadow-lg">
          
          {/* Meta Header */}
          <div className="flex justify-between items-start mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentDifficulty === Difficulty.EXPERT ? 'bg-red-500/20 text-red-400' :
              currentDifficulty === Difficulty.ADVANCED ? 'bg-orange-500/20 text-orange-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {currentDifficulty} Mode
            </span>
            <button 
              onClick={() => setShowHint(!showHint)}
              className="text-slate-400 hover:text-blue-400 transition-colors flex items-center text-xs font-medium bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-blue-500/50"
            >
              <HelpCircle className="w-3 h-3 mr-2" /> {showHint ? 'Hide Hint' : 'Hint'}
            </button>
          </div>
          
          {/* Question Text - Increased Size/Readability */}
          <div className="mb-8">
             <h2 className="text-xl md:text-2xl font-bold text-white mb-4 leading-snug">
                {question?.questionText}
             </h2>
          </div>
          
          {/* Hint Box */}
          {showHint && question?.hints && (
             <div className="bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 animate-fade-in">
               <p className="text-blue-200 text-sm font-medium flex gap-2">
                   <span>💡</span> {question.hints[0]}
               </p>
             </div>
          )}

          {/* Schema Visualizer - Beautified */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 text-slate-500 mb-3">
                <LayoutTemplate className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Database Schema</span>
            </div>
            <div className="bg-slate-950 rounded-lg border border-slate-800/60 relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900/50 border-b border-slate-800 flex items-center px-3 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">schema.sql</span>
                </div>
                <div className="p-4 pt-10 overflow-x-auto custom-scrollbar">
                     <pre className="font-mono text-xs text-slate-400 leading-relaxed whitespace-pre">
                         {question?.schemaContext}
                     </pre>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Work Area (Editor + Results) (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col h-full gap-6">
        
        {/* Editor Card */}
        <div className={`bg-slate-900 rounded-xl border overflow-hidden flex flex-col shadow-2xl transition-all duration-300 ${getEditorStyles()}`}>
          <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <Code2 className="w-4 h-4 text-slate-500" />
                 <span className="text-xs font-mono text-slate-400 font-medium">query_editor.sql</span>
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
                {userQuery.length} chars
            </div>
          </div>
          
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="w-full h-48 bg-[#0D1117] text-blue-100 font-mono p-4 outline-none resize-none text-sm leading-6 placeholder-slate-700"
            placeholder="-- Construct your query here..."
            spellCheck={false}
          />
          
          <div className="bg-slate-900 p-3 border-t border-slate-800 flex justify-between items-center">
               <div className="flex items-center gap-2">
                   {result && (
                       <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded ${result.isCorrect ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                           {result.isCorrect ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>}
                           {result.isCorrect ? 'Correct' : 'Incorrect'}
                       </span>
                   )}
               </div>
               <button
                onClick={handleSubmit}
                disabled={evaluating || !userQuery.trim()}
                className={`flex items-center px-5 py-2 rounded-lg font-bold text-sm transition-all ${
                  evaluating 
                    ? 'bg-blue-500/20 text-blue-300 cursor-wait' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transform active:scale-95'
                }`}
               >
                 {evaluating ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                    </>
                 ) : (
                     <>
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Execute
                     </>
                 )}
               </button>
          </div>
        </div>

        {/* Result / Feedback Output - Moved to Right Column for "Console" feel */}
        <div className="flex-grow bg-slate-800/30 border border-slate-700 rounded-xl p-1 overflow-hidden min-h-[300px]">
            {!result ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Terminal className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Ready for execution</p>
                </div>
            ) : (
                <div className="h-full flex flex-col bg-slate-900 rounded-lg overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
                    {/* Result Header */}
                    <div className={`px-6 py-4 border-b flex items-center justify-between ${
                        result.isCorrect 
                        ? 'bg-green-950/20 border-green-500/20' 
                        : 'bg-red-950/20 border-red-500/20'
                    }`}>
                       <div>
                            <h3 className={`font-bold ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                {result.isCorrect ? 'Query Successful' : 'Execution Error'}
                            </h3>
                       </div>
                       <div className="text-right">
                            <span className={`font-mono text-xl font-bold ${result.isCorrect ? 'text-green-500' : 'text-slate-600'}`}>
                                {result.scoreAwarded > 0 ? `+${result.scoreAwarded}` : '0'} XP
                            </span>
                       </div>
                    </div>

                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                        {/* Immediate Feedback */}
                        <div className="space-y-2">
                             <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Console Output</span>
                             <div className="font-mono text-sm text-slate-300 bg-black/30 p-3 rounded border border-slate-800">
                                 > {result.userFeedback}
                             </div>
                        </div>

                        {/* Explanation */}
                        <div className="space-y-2">
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-widest">Analysis</span>
                             <p className="text-slate-400 text-sm leading-relaxed">
                                 {result.explanation}
                             </p>
                        </div>

                        {/* Optimization & Correct Query */}
                        <div className="grid grid-cols-1 gap-4">
                             {!result.isCorrect && (
                                 <div className="space-y-2">
                                     <span className="text-xs font-bold uppercase text-emerald-500 tracking-widest">Optimal Solution</span>
                                     <div className="bg-slate-950 p-3 rounded border border-emerald-500/20 overflow-x-auto">
                                         <pre className="text-emerald-300 font-mono text-xs">{result.correctQuery}</pre>
                                     </div>
                                 </div>
                             )}
                             
                             {result.optimizationTip && result.optimizationTip !== 'N/A' && (
                                 <div className="flex gap-3 p-3 rounded bg-blue-500/5 border border-blue-500/20">
                                     <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                     <p className="text-xs text-blue-200">{result.optimizationTip}</p>
                                 </div>
                             )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 flex justify-end">
                             <button 
                                onClick={loadNewQuestion}
                                className="bg-white text-slate-900 hover:bg-slate-200 px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg"
                             >
                                Next Question
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

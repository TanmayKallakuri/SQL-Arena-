import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateQuizQuestion, evaluateSubmission } from '../services/geminiService';
import { QuizQuestion, EvaluationResult, Difficulty, UserProfile } from '../types';
import { Loader2, Play, HelpCircle, CheckCircle, XCircle, TrendingUp, Activity, BookOpen, Code2, Zap } from 'lucide-react';

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

  if (loading && !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
            <Loader2 className="w-12 h-12 text-blue-400 animate-spin relative z-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Summoning Interview Question...</h2>
        <p className="text-slate-500 text-sm">Preparing schema and test cases</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel: Question & Context & Results */}
      <div className="flex flex-col h-full space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentDifficulty === Difficulty.EXPERT ? 'bg-red-500/20 text-red-400' :
              currentDifficulty === Difficulty.ADVANCED ? 'bg-orange-500/20 text-orange-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {currentDifficulty}
            </span>
            <button 
              onClick={() => setShowHint(!showHint)}
              className="text-slate-400 hover:text-blue-400 transition-colors flex items-center text-sm"
            >
              <HelpCircle className="w-4 h-4 mr-1" /> {showHint ? 'Hide Hint' : 'Need Hint?'}
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 leading-tight">{question?.questionText}</h2>
          
          {showHint && question?.hints && (
             <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-4 animate-fade-in">
               <p className="text-blue-300 text-sm italic">💡 Hint: {question.hints[0]}</p>
             </div>
          )}

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 font-mono text-sm text-slate-300">
            <h3 className="text-slate-500 text-xs uppercase font-bold mb-2">Schema Context</h3>
            <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{question?.schemaContext}</pre>
          </div>
        </div>

        {/* Beautified Feedback Area */}
        {result && (
           <div className={`rounded-xl border animate-fade-in overflow-hidden flex-shrink-0 mb-4 ${
            result.isCorrect 
              ? 'bg-green-950/10 border-green-500/20' 
              : 'bg-red-950/10 border-red-500/20'
          }`}>
            {/* Header Banner */}
            <div className={`px-6 py-4 border-b ${
              result.isCorrect ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
            } flex items-center justify-between`}>
               <div className="flex items-center gap-3">
                  {result.isCorrect ? (
                      <div className="bg-green-500/20 p-1.5 rounded-full">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                  ) : (
                      <div className="bg-red-500/20 p-1.5 rounded-full">
                        <XCircle className="w-6 h-6 text-red-500" />
                      </div>
                  )}
                  <div>
                    <h3 className={`text-lg font-bold leading-none ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {result.isCorrect ? 'Perfect Execution' : 'Solution Analysis'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide">
                        {result.isCorrect ? 'Test Cases Passed' : 'Incorrect Result'}
                    </p>
                  </div>
               </div>
               <div className="text-right">
                    <span className={`font-mono text-lg font-bold ${result.isCorrect ? 'text-green-400' : 'text-slate-500'}`}>
                        {result.scoreAwarded > 0 ? '+' : ''}{result.scoreAwarded}
                    </span>
                    <span className="text-xs text-slate-500 block uppercase">XP Gained</span>
               </div>
            </div>

            <div className="p-6 space-y-8">
               {/* Feedback Section - Highlighted if wrong */}
               <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                     <Activity className="w-4 h-4 text-blue-400" /> 
                     Review
                  </h4>
                  <p className={`leading-relaxed p-4 rounded-lg border ${
                      result.isCorrect 
                      ? 'bg-slate-900/50 border-slate-800 text-slate-300'
                      : 'bg-red-900/10 border-red-500/20 text-slate-200 shadow-inner shadow-red-900/5'
                  }`}>
                    {result.userFeedback}
                  </p>
               </div>

               {/* Conceptual Explanation */}
               <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                     <BookOpen className="w-4 h-4 text-purple-400" /> 
                     Concept Deep Dive
                  </h4>
                  <div className="text-slate-300 text-sm leading-7">
                    {result.explanation}
                  </div>
               </div>

               {/* Correct Solution - Show if wrong or if it exists (always good for learning) */}
               <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-slate-500 flex items-center gap-2">
                     <Code2 className="w-4 h-4 text-emerald-400" /> 
                     Optimal Query
                  </h4>
                  <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-lg">
                    <div className="absolute top-0 left-0 right-0 h-6 bg-slate-900 border-b border-slate-800 flex items-center px-3 space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                    </div>
                    <pre className="p-4 pt-8 text-blue-300 font-mono text-sm overflow-x-auto selection:bg-blue-500/30">
                        {result.correctQuery}
                    </pre>
                  </div>
               </div>

               {/* Optimization Tip */}
               {result.optimizationTip && result.optimizationTip !== "N/A" && (
                   <div className="bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-400" />
                          <h5 className="font-bold text-blue-400 text-sm uppercase tracking-wide">Pro Optimization Tip</h5>
                      </div>
                      <p className="text-slate-400 text-sm italic">{result.optimizationTip}</p>
                   </div>
               )}
               
               <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                    {result.suggestDifficultyIncrease && currentDifficulty !== Difficulty.EXPERT ? (
                        <button 
                            onClick={handleIncreaseDifficulty}
                            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors text-sm font-bold px-3 py-2 rounded-lg hover:bg-yellow-500/10"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Level Up Difficulty?
                        </button>
                    ) : <div></div>}

                    <button 
                        onClick={loadNewQuestion}
                        className="bg-slate-100 hover:bg-white text-slate-900 px-6 py-2.5 rounded-lg font-bold transition-all transform hover:scale-105 shadow-lg shadow-white/5"
                    >
                        Next Challenge
                    </button>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Code Editor */}
      <div className="flex flex-col h-full">
        <div className="flex-grow bg-slate-900 rounded-t-xl border border-slate-700 border-b-0 overflow-hidden flex flex-col">
          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <span className="text-xs font-mono text-slate-500">query.sql</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
            </div>
          </div>
          <textarea
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-grow w-full bg-slate-900 text-slate-300 font-mono p-4 outline-none resize-none text-sm leading-relaxed selection:bg-blue-500/30 placeholder-slate-700"
            placeholder="-- Type your SQL solution here...&#10;SELECT * FROM tables WHERE..."
            spellCheck={false}
          />
        </div>
        
        <div className="bg-slate-800 p-4 rounded-b-xl border border-slate-700 flex justify-between items-center">
           <div className="text-xs text-slate-500 font-mono">
             {userQuery.length} chars
           </div>
           <button
            onClick={handleSubmit}
            disabled={evaluating || !userQuery.trim() || !!result}
            className={`flex items-center px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              evaluating 
                ? 'bg-blue-500/50 cursor-wait' 
                : result
                  ? 'bg-slate-700 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 text-white hover:shadow-blue-500/30'
            }`}
           >
             {evaluating ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Grading...
                </>
             ) : (
                 <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    Run Query
                 </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};
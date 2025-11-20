import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getTopicDeepDive } from '../services/geminiService';
import { STATIC_CONTENT } from '../services/staticContent';
import { ArrowLeft, Loader2, RefreshCw, BookOpen, Terminal } from 'lucide-react';
import { TOPICS } from '../constants';

export const Theory: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const topicMeta = TOPICS.find(t => t.id === topicId);

  const loadContent = async (forceRefresh = false) => {
    if (!topicMeta) return;
    
    setLoading(true);
    const cacheKey = `sql_arena_theory_${topicMeta.id}`;
    
    // 1. Check for Static Content (Instant Load)
    if (!forceRefresh && STATIC_CONTENT[topicMeta.title]) {
        setContent(STATIC_CONTENT[topicMeta.title]);
        setLoading(false);
        return;
    }

    // 2. Check LocalStorage Cache
    if (!forceRefresh) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setContent(cached);
            setLoading(false);
            return;
        }
    }

    // 3. Fetch from AI (Fallback or Force Refresh)
    try {
        const text = await getTopicDeepDive(topicMeta.title);
        setContent(text);
        localStorage.setItem(cacheKey, text);
    } catch (error) {
        console.error("Failed to load notes", error);
        setContent("## Error loading content.\nPlease try again.");
    } finally {
        setLoading(false);
        setIsRegenerating(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [topicId, topicMeta]);

  const handleRegenerate = () => {
      setIsRegenerating(true);
      loadContent(true);
  };

  if (!topicMeta) return <div>Topic not found</div>;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      <div className="flex items-center justify-between mb-6">
        <Link to="/learn" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Academy
        </Link>
        
        {!loading && (
            <button 
                onClick={handleRegenerate}
                className={`flex items-center text-xs text-slate-500 hover:text-blue-400 transition-colors ${isRegenerating ? 'animate-spin' : ''}`}
                disabled={isRegenerating}
            >
                <RefreshCw className="w-3 h-3 mr-1" />
                {isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}
            </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 border-b border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <BookOpen className="w-6 h-6 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{topicMeta.title}</h1>
                </div>
                <p className="text-slate-400 text-sm max-w-2xl">
                    Comprehensive study module based on the Class of '26 curriculum.
                </p>
            </div>
            <Link 
                to={`/quiz/${topicId}`}
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 hover:scale-105 whitespace-nowrap"
            >
                Take Quiz
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
        </div>

        {/* Content Area */}
        <div className="p-8 min-h-[60vh] bg-slate-900">
            {loading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-white font-medium text-lg">Retrieving Curriculum Data...</p>
                    <p className="text-slate-500 text-sm">Compiling notes from lecture materials</p>
                </div>
            </div>
            ) : (
            <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mt-12 mb-8 pb-4 border-b border-slate-800" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-blue-400 mt-10 mb-4 flex items-center before:content-['#'] before:mr-2 before:text-blue-500/50" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-slate-200 mt-8 mb-3" {...props} />,
                        p: ({node, ...props}) => <p className="text-slate-300 leading-8 mb-6" {...props} />,
                        strong: ({node, ...props}) => <strong className="text-white font-bold bg-white/5 px-1 rounded" {...props} />,
                        ul: ({node, ...props}) => <ul className="space-y-2 mb-6 ml-4" {...props} />,
                        li: ({node, ...props}) => (
                            <li className="flex items-start text-slate-300">
                                <span className="mr-2 mt-2 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                <span className="leading-7">{props.children}</span>
                            </li>
                        ),
                        blockquote: ({node, ...props}) => (
                            <div className="my-8 border-l-4 border-blue-500 bg-blue-500/5 p-6 rounded-r-lg">
                                <div className="text-blue-300 italic font-medium" {...props} />
                            </div>
                        ),
                        code: ({node, ...props}) => {
                            const match = /language-(\w+)/.exec(props.className || '')
                            const isInline = !match && !String(props.children).includes('\n');
                            return isInline 
                                ? <code className="bg-slate-800 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-700" {...props} />
                                : (
                                    <div className="my-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shadow-xl">
                                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                            <div className="flex space-x-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                                            </div>
                                            <div className="text-xs text-slate-500 font-mono">SQL</div>
                                        </div>
                                        <div className="p-6 overflow-x-auto">
                                            <code className="font-mono text-sm text-slate-300 leading-relaxed block" {...props} />
                                        </div>
                                    </div>
                                )
                        },
                        table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-8 border border-slate-700 rounded-lg shadow-lg">
                                <table className="w-full text-left border-collapse" {...props} />
                            </div>
                        ),
                        thead: ({node, ...props}) => <thead className="bg-slate-800 text-white" {...props} />,
                        th: ({node, ...props}) => <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-b border-slate-700 text-blue-400" {...props} />,
                        tr: ({node, ...props}) => <tr className="border-b border-slate-700/50 last:border-0 hover:bg-slate-800/30 transition-colors" {...props} />,
                        td: ({node, ...props}) => <td className="px-6 py-4 text-sm text-slate-300 whitespace-pre-wrap" {...props} />,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};
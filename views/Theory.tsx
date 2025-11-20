import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getTopicDeepDive } from '../services/geminiService';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { TOPICS } from '../constants';

export const Theory: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  const topicMeta = TOPICS.find(t => t.id === topicId);

  useEffect(() => {
    const fetchContent = async () => {
      if (topicMeta) {
        setLoading(true);
        const text = await getTopicDeepDive(topicMeta.title);
        setContent(text);
        setLoading(false);
      }
    };
    fetchContent();
  }, [topicId, topicMeta]);

  if (!topicMeta) return <div>Topic not found</div>;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <Link to="/learn" className="inline-flex items-center text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Academy
      </Link>

      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 min-h-[60vh]">
        <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white">{topicMeta.title}</h1>
                <p className="text-blue-400 mt-2">Deep Dive Module</p>
            </div>
            <Link 
                to={`/quiz/${topicId}`}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
                Test Knowledge
            </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-slate-400 animate-pulse">Generating customized study material...</p>
          </div>
        ) : (
          <div className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};
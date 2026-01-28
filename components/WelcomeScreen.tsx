import React, { useState } from 'react';
import { Difficulty, QuizConfig } from '../types';
import { Brain, Zap, Target, BookOpen, Loader2 } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (config: QuizConfig) => void;
  isLoading: boolean;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('GATE');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStart({ topic, examType, difficulty, questionCount: 5 });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-3 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">ExamNinja AI</h1>
            <p className="text-indigo-100 mt-2 text-sm font-medium">Master Indian Competitive Exams</p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What do you want to study?
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Thermodynamics, Linear Algebra, General English"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Exam Pattern</label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <select
                    value={examType}
                    onChange={(e) => setExamType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white text-slate-800"
                  >
                    <option value="GATE">GATE</option>
                    <option value="SSC">SSC CGL</option>
                    <option value="UPSC">UPSC CSAT</option>
                    <option value="CAT">CAT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Difficulty</label>
                <div className="relative">
                  <Zap className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white text-slate-800"
                  >
                    <option value={Difficulty.EASY}>Easy</option>
                    <option value={Difficulty.MEDIUM}>Medium</option>
                    <option value={Difficulty.HARD}>Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generative AI Thinking...
                </>
              ) : (
                <>
                  Start Challenge
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs">ENTER</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Powered by Google Gemini 3 Flash • Real-time Speed Drill
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
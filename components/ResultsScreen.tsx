import React from 'react';
import { GameState, UserAnswer } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RefreshCcw, Home, CheckCircle, XCircle, Clock, BookOpen, Brain } from 'lucide-react';

interface ResultsScreenProps {
  gameState: GameState;
  onRestart: () => void;
  onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ gameState, onRestart, onHome }) => {
  const correctCount = gameState.answers.filter(a => a.isCorrect).length;
  const totalQuestions = gameState.questions.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  
  const avgTime = Math.round(
    gameState.answers.reduce((acc, curr) => acc + curr.timeTaken, 0) / totalQuestions
  );

  const chartData = gameState.answers.map((a, i) => ({
    name: `Q${i + 1}`,
    time: a.timeTaken,
    isCorrect: a.isCorrect
  }));

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Stats */}
        <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div>
               <h1 className="text-3xl font-bold mb-2">Session Complete!</h1>
               <p className="text-indigo-200">Here is your Aptitude DNA report.</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col items-center bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
               <span className="text-4xl font-extrabold text-yellow-400">{gameState.score}</span>
               <span className="text-xs uppercase tracking-widest opacity-80">Total Score</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-indigo-800/50 p-4 rounded-xl flex flex-col items-center">
               <CheckCircle className="mb-2 text-green-400 w-6 h-6" />
               <span className="text-2xl font-bold">{accuracy}%</span>
               <span className="text-xs text-indigo-300">Accuracy</span>
            </div>
            <div className="bg-indigo-800/50 p-4 rounded-xl flex flex-col items-center">
               <Clock className="mb-2 text-blue-400 w-6 h-6" />
               <span className="text-2xl font-bold">{avgTime}s</span>
               <span className="text-xs text-indigo-300">Avg. Time</span>
            </div>
            <div className="bg-indigo-800/50 p-4 rounded-xl flex flex-col items-center">
               <BookOpen className="mb-2 text-purple-400 w-6 h-6" />
               <span className="text-2xl font-bold">{totalQuestions}</span>
               <span className="text-xs text-indigo-300">Questions</span>
            </div>
          </div>
        </div>

        {/* Time Analysis Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Speed & Performance Analysis</h3>
           <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="s" />
                 <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isCorrect ? '#4ade80' : '#f87171'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Detailed Review */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 px-2">Detailed Solutions</h3>
          {gameState.questions.map((q, idx) => {
            const userAnswer = gameState.answers.find(a => a.questionId === q.id);
            const isCorrect = userAnswer?.isCorrect;

            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex gap-4">
                  <div className="flex-shrink-0">
                    {isCorrect ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-bold text-slate-400 uppercase">Question {idx + 1}</span>
                       <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {isCorrect ? 'Correct' : 'Incorrect'}
                       </span>
                    </div>
                    <p className="text-slate-800 font-semibold text-lg">{q.text}</p>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <span className="text-xs text-slate-400 block mb-1">Correct Answer</span>
                        <p className="font-mono text-green-600 font-bold">{q.correctAnswer.join(', ')}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <span className="text-xs text-slate-400 block mb-1">Your Answer</span>
                        <p className={`font-mono font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {userAnswer?.selectedOptions.length ? userAnswer.selectedOptions.join(', ') : '(Skipped)'}
                        </p>
                      </div>
                   </div>
                   
                   <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                     <div className="flex items-center gap-2 mb-2">
                       <Brain className="w-4 h-4 text-indigo-600" />
                       <span className="text-sm font-bold text-indigo-700">AI Explanation</span>
                     </div>
                     <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{q.explanation}</p>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-12">
           <button 
             onClick={onRestart}
             className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
           >
             <RefreshCcw className="w-5 h-5" />
             Replay Same Topic
           </button>
           <button 
             onClick={onHome}
             className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
           >
             <Home className="w-5 h-5" />
             New Challenge
           </button>
        </div>

      </div>
    </div>
  );
};

export default ResultsScreen;
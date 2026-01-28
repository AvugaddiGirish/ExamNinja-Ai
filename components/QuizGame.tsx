import React, { useState, useEffect, useCallback } from 'react';
import { Question, QuestionType, UserAnswer } from '../types';
import { Clock, CheckCircle2, XCircle, Trophy, Flame } from 'lucide-react';
import clsx from 'clsx';

interface QuizGameProps {
  questions: Question[];
  onGameEnd: (answers: UserAnswer[], score: number) => void;
}

const QuizGame: React.FC<QuizGameProps> = ({ questions, onGameEnd }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // For MCQ/MSQ
  const [natInput, setNatInput] = useState(''); // For NAT
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);

  const currentQuestion = questions[currentIdx];

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(30); // Reset timer
      setSelectedOptions([]);
      setNatInput('');
      setIsAnswered(false);
    } else {
      onGameEnd(answers, score);
    }
  }, [currentIdx, questions.length, onGameEnd, answers, score]);

  // Timer Logic
  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered]);

  const handleSubmit = () => {
    if (isAnswered) return;

    let isCorrect = false;
    const finalSelection = currentQuestion.type === QuestionType.NAT 
      ? [natInput.trim()] 
      : selectedOptions;

    // Check Logic
    if (currentQuestion.type === QuestionType.NAT) {
      // Basic number comparison (string based to avoid float issues, but loose equality)
      // Remove spaces for comparison
      const userVal = finalSelection[0];
      const correctVal = currentQuestion.correctAnswer[0];
      isCorrect = userVal === correctVal;
    } else if (currentQuestion.type === QuestionType.MSQ) {
      // Check if arrays have same elements
      const s = new Set(finalSelection);
      const c = new Set(currentQuestion.correctAnswer);
      isCorrect = s.size === c.size && [...s].every(x => c.has(x));
    } else {
      // MCQ
      isCorrect = currentQuestion.correctAnswer.includes(finalSelection[0]);
    }

    // Scoring
    let points = 0;
    if (isCorrect) {
      const basePoints = 100;
      const timeBonus = Math.floor(timeLeft * 2); // 2 points per second left
      points = (basePoints + timeBonus) * comboMultiplier;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setComboMultiplier(prev => Math.min(prev + 0.2, 2)); // Cap multiplier at 2x
    } else {
      setStreak(0);
      setComboMultiplier(1);
      // Negative marking for GATE MCQ (1/3rd usually) - Let's do simplified -25
      if (currentQuestion.type === QuestionType.MCQ) {
        setScore(prev => Math.max(0, prev - 25));
      }
    }

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOptions: finalSelection,
      isCorrect,
      timeTaken: 30 - timeLeft
    };

    setAnswers(prev => [...prev, newAnswer]);
    setIsAnswered(true);

    // Auto advance after short delay
    setTimeout(() => {
      handleNext();
    }, 2500); // 2.5s delay to read the feedback
  };

  const toggleOption = (opt: string) => {
    if (isAnswered) return;

    if (currentQuestion.type === QuestionType.MCQ) {
      setSelectedOptions([opt]);
    } else if (currentQuestion.type === QuestionType.MSQ) {
      setSelectedOptions(prev => 
        prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
      );
    }
  };

  // Determine button/option styles based on state
  const getOptionStyle = (opt: string) => {
    const isSelected = selectedOptions.includes(opt);
    const isCorrectAns = currentQuestion.correctAnswer.includes(opt);

    if (isAnswered) {
      if (isCorrectAns) return "bg-green-500 text-white border-green-600 ring-2 ring-green-300";
      if (isSelected && !isCorrectAns) return "bg-red-500 text-white border-red-600 opacity-80";
      return "bg-slate-100 text-slate-400 opacity-50";
    }

    if (isSelected) return "bg-indigo-600 text-white border-indigo-700 shadow-md transform scale-[1.02]";
    return "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300";
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      {/* Top Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
           <Trophy className="text-yellow-500 w-5 h-5" />
           <span className="font-bold text-slate-800">{Math.round(score)}</span>
        </div>
        
        <div className={clsx(
          "flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl border-4 shadow-lg transition-all",
          timeLeft < 10 ? "bg-red-50 text-red-600 border-red-500 animate-pulse" : "bg-white text-slate-700 border-indigo-500"
        )}>
           {timeLeft}
        </div>

        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
           <Flame className={clsx("w-5 h-5", streak > 2 ? "text-orange-500 animate-bounce" : "text-slate-300")} />
           <span className={clsx("font-bold", streak > 2 ? "text-orange-500" : "text-slate-400")}>x{streak}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-start">
           <div>
             <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md">
               {currentQuestion.type}
             </span>
             <h2 className="mt-3 text-xl md:text-2xl font-bold text-slate-800 leading-snug">
               {currentQuestion.text}
             </h2>
           </div>
           <div className="text-slate-400 text-sm font-medium">
             {currentIdx + 1}/{questions.length}
           </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          {currentQuestion.type === QuestionType.NAT ? (
             <div className="w-full max-w-md mx-auto">
                <label className="block text-sm font-medium text-slate-600 mb-2">Enter your numerical answer:</label>
                <input 
                  type="text" 
                  value={natInput}
                  onChange={(e) => setNatInput(e.target.value)}
                  disabled={isAnswered}
                  className="w-full text-center text-3xl font-bold py-4 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all disabled:opacity-70 disabled:bg-slate-50 text-slate-800"
                  placeholder="0.00"
                />
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options?.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleOption(opt)}
                  disabled={isAnswered}
                  className={clsx(
                    "p-4 rounded-xl text-left font-medium border-2 transition-all duration-200 relative",
                    getOptionStyle(opt)
                  )}
                >
                  <div className="flex items-start">
                     <span className="mr-3 opacity-60 font-mono text-sm pt-0.5">{String.fromCharCode(65 + idx)}.</span>
                     <span>{opt}</span>
                  </div>
                  {isAnswered && currentQuestion.correctAnswer.includes(opt) && (
                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-green-500" />
                  )}
                  {isAnswered && selectedOptions.includes(opt) && !currentQuestion.correctAnswer.includes(opt) && (
                     <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-red-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Feedback */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end items-center h-24">
           {isAnswered ? (
             <div className="flex-1">
                <p className={clsx("font-bold text-lg", answers[answers.length-1]?.isCorrect ? "text-green-600" : "text-red-600")}>
                  {answers[answers.length-1]?.isCorrect ? "Correct! Well done." : "Incorrect!"}
                </p>
                <p className="text-sm text-slate-500">Next question coming up...</p>
             </div>
           ) : (
             <button 
               onClick={handleSubmit}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Submit Answer
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default QuizGame;
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import QuizGame from './components/QuizGame';
import ResultsScreen from './components/ResultsScreen';
import { GameState, QuizConfig, UserAnswer } from './types';
import { generateQuestions } from './services/gemini';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    streak: 0,
    answers: [],
    status: 'idle',
  });

  const [lastConfig, setLastConfig] = useState<QuizConfig | null>(null);

  const startQuiz = async (config: QuizConfig) => {
    setLastConfig(config);
    setGameState(prev => ({ ...prev, status: 'loading' }));

    try {
      const questions = await generateQuestions(config.topic, config.examType, config.difficulty, config.questionCount);
      setGameState({
        questions,
        currentQuestionIndex: 0,
        score: 0,
        streak: 0,
        answers: [],
        status: 'playing',
      });
    } catch (error) {
      alert("Failed to generate quiz. Please check your connection or try a different topic.");
      setGameState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleGameEnd = (answers: UserAnswer[], finalScore: number) => {
    setGameState(prev => ({
      ...prev,
      answers,
      score: finalScore,
      status: 'results'
    }));
  };

  const handleRestart = () => {
    if (lastConfig) {
      startQuiz(lastConfig);
    }
  };

  const handleHome = () => {
    setGameState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      streak: 0,
      answers: [],
      status: 'idle',
    });
  };

  return (
    <div className="font-sans text-slate-900">
      {gameState.status === 'idle' || gameState.status === 'loading' ? (
        <WelcomeScreen onStart={startQuiz} isLoading={gameState.status === 'loading'} />
      ) : gameState.status === 'playing' ? (
        <QuizGame 
          questions={gameState.questions} 
          onGameEnd={handleGameEnd} 
        />
      ) : gameState.status === 'results' ? (
        <ResultsScreen 
          gameState={gameState} 
          onRestart={handleRestart} 
          onHome={handleHome} 
        />
      ) : null}
    </div>
  );
};

export default App;
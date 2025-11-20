import React, { useState, useEffect, PropsWithChildren } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './views/Home';
import { Learn } from './views/Learn';
import { Theory } from './views/Theory';
import { Quiz } from './views/Quiz';
import { Leaderboard } from './views/Leaderboard';
import { Difficulty, UserProfile } from './types';

// Protected Route Wrapper moved outside main component
const ProtectedRoute = ({ isAllowed, children }: PropsWithChildren<{ isAllowed: boolean }>) => {
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  // Initialize state from LocalStorage if available
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('sql_arena_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load profile from storage", e);
    }
    return {
      name: '',
      currentScore: 0,
      streak: 0,
      selectedDifficulty: Difficulty.INTERMEDIATE
    };
  });

  // Persist to LocalStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('sql_arena_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  const handleProfileUpdate = (name: string, difficulty: Difficulty) => {
    setUserProfile(prev => ({ ...prev, name, selectedDifficulty: difficulty }));
  };

  const handleScoreUpdate = (points: number) => {
    setUserProfile(prev => ({
      ...prev,
      currentScore: prev.currentScore + points,
      streak: prev.streak + 1
    }));
  };

  const handleDifficultyUpdate = (diff: Difficulty) => {
      setUserProfile(prev => ({ ...prev, selectedDifficulty: diff }));
  };

  const handleResetProfile = () => {
    const emptyProfile = {
      name: '',
      currentScore: 0,
      streak: 0,
      selectedDifficulty: Difficulty.INTERMEDIATE
    };
    setUserProfile(emptyProfile);
    localStorage.removeItem('sql_arena_profile');
  };

  const isAuthenticated = !!userProfile.name;

  return (
    <Router>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                userProfile={userProfile}
                setUserProfile={handleProfileUpdate} 
                onReset={handleResetProfile}
              />
            } 
          />
          
          <Route 
            path="/learn" 
            element={
              <ProtectedRoute isAllowed={isAuthenticated}>
                <Learn />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/learn/:topicId" 
            element={
              <ProtectedRoute isAllowed={isAuthenticated}>
                <Theory />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/quiz/:topicId" 
            element={
              <ProtectedRoute isAllowed={isAuthenticated}>
                <Quiz 
                    userProfile={userProfile} 
                    updateScore={handleScoreUpdate} 
                    updateDifficulty={handleDifficultyUpdate}
                />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute isAllowed={isAuthenticated}>
                <Leaderboard currentUser={userProfile} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
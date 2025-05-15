import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 페이지 컴포넌트들 import
import Home from './components/Home';
import GamePage from './components/GamePage';
import AdPage from './components/AdPage';
import DailyChallenge from './components/DailyChallenge';
import Settings from './components/Settings';
import Leaderboard from './components/Leaderboard';

// 게임 기록 컨텍스트
import { GameRecordProvider } from './contexts/GameRecordContext';

function App() {
  return (
    <GameRecordProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>퍼즐 파라다이스 (Puzzle Paradise)</h1>
          </header>
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/game/:gameId" element={<GamePage />} />
              <Route path="/ad/:adId" element={<AdPage />} />
              <Route path="/daily-challenge" element={<DailyChallenge />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
          <footer>
            <p>&copy; 2023 퍼즐 파라다이스 - 재미있는 퍼즐 게임과 광고</p>
          </footer>
        </div>
      </Router>
    </GameRecordProvider>
  );
}

export default App;

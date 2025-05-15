import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdComponent from './AdComponent';
import { useGameRecord } from '../contexts/GameRecordContext';

// 게임 컴포넌트들을 불러옵니다
import NumberPuzzle from '../games/NumberPuzzle';
import WordSearch from '../games/WordSearch';
import MemoryMatch from '../games/MemoryMatch';
import ColorSort from '../games/ColorSort';
import PatternMatch from '../games/PatternMatch';

// 임시로 게임 데이터를 저장합니다 (나중에 context나 API 호출로 대체 가능)
const gameData = {
  'number-puzzle': {
    name: '숫자 퍼즐',
    component: NumberPuzzle,
    difficulty: ['쉬움', '보통', '어려움'],
    adFrequency: 3, // 힌트 사용 3번마다 광고 표시
  },
  'word-search': {
    name: '단어 찾기',
    component: WordSearch,
    difficulty: ['초급', '중급', '고급'],
    adFrequency: 2,
  },
  'memory-match': {
    name: '메모리 매칭',
    component: MemoryMatch,
    difficulty: ['4x4', '6x6', '8x8'],
    adFrequency: 4,
  },
  'color-sort': {
    name: '색상 정렬',
    component: ColorSort,
    difficulty: ['쉬움', '보통', '어려움'],
    adFrequency: 3,
  },
  'pattern-match': {
    name: '패턴 인식',
    component: PatternMatch,
    difficulty: ['기본', '고급', '전문가'],
    adFrequency: 2,
  },
};

function GamePage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [hintCount, setHintCount] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  
  // 게임 기록 컨텍스트 사용
  const { saveGameRecord, getGameRecords } = useGameRecord();

  // 현재 게임 정보를 가져옵니다
  const currentGame = gameData[gameId];

  // 게임이 존재하지 않으면 홈으로 리다이렉트
  useEffect(() => {
    if (!currentGame) {
      navigate('/');
    }
  }, [currentGame, navigate]);
  
  // 이전 게임 점수 불러오기
  useEffect(() => {
    if (gameId) {
      const gameRecords = getGameRecords(gameId);
      if (gameRecords && gameRecords.highScores.length > 0) {
        // 이전 최고 점수 설정
        setScore(gameRecords.highScores[0].score);
      }
    }
  }, [gameId, getGameRecords]);

  // 힌트 사용 함수
  const useHint = () => {
    const newHintCount = hintCount + 1;
    setHintCount(newHintCount);
    
    // 힌트 사용 횟수가 광고 빈도에 도달하면 광고 페이지로 이동
    if (newHintCount % currentGame.adFrequency === 0) {
      // 광고 ID를 임의로 생성하여 광고 페이지로 이동
      const adId = `ad-${Date.now()}`;
      navigate(`/ad/${adId}?returnTo=/game/${gameId}`);
    }
    
    return true; // 힌트 사용 성공
  };

  // 게임 시작 함수
  const startGame = () => {
    setGameStarted(true);
    setHintCount(0);
  };

  // 게임 종료 함수
  const endGame = (finalScore) => {
    setGameStarted(false);
    setScore(finalScore);
    
    // 게임 기록 저장
    saveGameRecord(gameId, finalScore, selectedDifficulty);
    
    // 광고 표시
    const adId = `ad-${Date.now()}`;
    navigate(`/ad/${adId}?returnTo=/game/${gameId}&score=${finalScore}`);
  };

  if (!currentGame) {
    return <div>로딩 중...</div>;
  }

  const GameComponent = currentGame.component;

  return (
    <div className="game-page">
      <h2>{currentGame.name}</h2>
      
      {!gameStarted ? (
        <>
          <div className="game-setup">
            <div className="difficulty-selector">
              <h3>난이도 선택</h3>
              <div className="difficulty-buttons">
                {currentGame.difficulty.map((level, index) => (
                  <button
                    key={level}
                    className={selectedDifficulty === index ? 'selected' : ''}
                    onClick={() => setSelectedDifficulty(index)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="start-button" onClick={startGame}>
              게임 시작
            </button>
            
            {score > 0 && (
              <div className="previous-score">
                <h3>이전 최고 점수</h3>
                <p>{score}점</p>
                <p className="small-text">더 높은 점수에 도전해보세요!</p>
                <Link to="/leaderboard" className="view-leaderboard-link">전체 순위 보기</Link>
              </div>
            )}
          </div>
          
          {/* 게임 시작 전 광고 표시 */}
          <div className="game-page-ad">
            <p className="ad-label">광고</p>
            <AdComponent 
              adSlot="1357924680" // 실제 광고 슬롯 ID로 대체 필요
              format="rectangle"
              responsive={true}
            />
          </div>
        </>
      ) : (
        <>
          <GameComponent
            difficulty={selectedDifficulty}
            onUseHint={useHint}
            onGameEnd={endGame}
          />
          
          {/* 게임 중 사이드 광고 (높은 난이도에서만) */}
          {selectedDifficulty > 0 && (
            <div className="game-side-ad">
              <p className="ad-label">광고</p>
              <AdComponent 
                adSlot="2468013579" // 실제 광고 슬롯 ID로 대체 필요
                format="vertical"
                responsive={false}
              />
              <p className="ad-support-text">광고는 게임 개발을 지원합니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GamePage; 
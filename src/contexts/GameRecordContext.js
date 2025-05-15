import React, { createContext, useContext, useState, useEffect } from 'react';

// 게임 기록 컨텍스트 생성
const GameRecordContext = createContext();

// 게임 ID 상수 설정
const GAME_IDS = {
  'number-puzzle': '숫자 퍼즐',
  'word-search': '단어 찾기',
  'memory-match': '메모리 매칭',
  'color-sort': '색상 정렬',
  'pattern-match': '패턴 인식',
};

// 게임 기록 제공자 컴포넌트
export const GameRecordProvider = ({ children }) => {
  // 모든 게임 기록 상태
  const [gameRecords, setGameRecords] = useState({});
  
  // 컴포넌트 마운트 시 로컬 스토리지에서 게임 기록 불러오기
  useEffect(() => {
    // 이전 기록 마이그레이션
    const oldRecords = localStorage.getItem('puzzleAd_gameRecords');
    
    // 새 스토리지 키 확인
    const savedRecords = localStorage.getItem('puzzleParadise_gameRecords') || oldRecords;
    
    if (savedRecords) {
      // 새 스토리지에 저장
      if (oldRecords && !localStorage.getItem('puzzleParadise_gameRecords')) {
        localStorage.setItem('puzzleParadise_gameRecords', oldRecords);
      }
      
      setGameRecords(JSON.parse(savedRecords));
    } else {
      // 초기 게임 기록 구조 설정
      const initialRecords = {};
      Object.keys(GAME_IDS).forEach(gameId => {
        initialRecords[gameId] = {
          highScores: [], // 상위 점수 기록
          totalPlays: 0,  // 총 플레이 횟수
          lastPlayed: null, // 마지막 플레이 시간
        };
      });
      setGameRecords(initialRecords);
    }
    
    // 이전 플레이어 이름 마이그레이션
    const oldPlayerName = localStorage.getItem('puzzleAd_playerName');
    if (oldPlayerName && !localStorage.getItem('puzzleParadise_playerName')) {
      localStorage.setItem('puzzleParadise_playerName', oldPlayerName);
    }
  }, []);
  
  // 게임 기록 저장 함수
  const saveGameRecord = (gameId, score, difficulty) => {
    if (!gameId || !GAME_IDS[gameId]) return; // 유효하지 않은 게임 ID 체크
    
    const timestamp = new Date().toISOString();
    
    setGameRecords(prevRecords => {
      // 기존 게임 기록 복사
      const currentGameRecords = prevRecords[gameId] || {
        highScores: [],
        totalPlays: 0,
        lastPlayed: null,
      };
      
      // 새로운 점수 기록 생성
      const newScore = {
        score,
        difficulty,
        timestamp,
        playerName: localStorage.getItem('puzzleParadise_playerName') || '익명',
      };
      
      // 상위 점수 목록에 새 점수 추가하고 정렬
      const updatedHighScores = [...currentGameRecords.highScores, newScore]
        .sort((a, b) => b.score - a.score) // 점수 내림차순 정렬
        .slice(0, 10); // 상위 10개만 유지
      
      // 게임별 기록 업데이트
      const updatedGameRecords = {
        ...prevRecords,
        [gameId]: {
          highScores: updatedHighScores,
          totalPlays: currentGameRecords.totalPlays + 1,
          lastPlayed: timestamp,
        },
      };
      
      // 로컬 스토리지에 저장
      localStorage.setItem('puzzleParadise_gameRecords', JSON.stringify(updatedGameRecords));
      
      return updatedGameRecords;
    });
  };
  
  // 플레이어 이름 설정 함수
  const setPlayerName = (name) => {
    if (name && name.trim()) {
      localStorage.setItem('puzzleParadise_playerName', name.trim());
    }
  };
  
  // 플레이어 이름 가져오기
  const getPlayerName = () => {
    return localStorage.getItem('puzzleParadise_playerName') || '익명';
  };
  
  // 게임 기록 가져오기
  const getGameRecords = (gameId) => {
    if (gameId) {
      return gameRecords[gameId] || { highScores: [], totalPlays: 0, lastPlayed: null };
    }
    return gameRecords;
  };
  
  // 모든 게임의 최고 점수 가져오기
  const getAllHighScores = () => {
    const allScores = [];
    
    Object.keys(gameRecords).forEach(gameId => {
      if (gameRecords[gameId].highScores.length > 0) {
        // 각 게임의 높은 점수들에 게임 ID와 이름 추가하여 배열에 추가
        gameRecords[gameId].highScores.forEach(record => {
          allScores.push({
            ...record,
            gameId,
            gameName: GAME_IDS[gameId],
          });
        });
      }
    });
    
    // 전체 점수 내림차순 정렬
    return allScores.sort((a, b) => b.score - a.score);
  };
  
  // 게임 기록 초기화 함수
  const resetGameRecords = () => {
    // 초기 게임 기록 구조 설정
    const initialRecords = {};
    Object.keys(GAME_IDS).forEach(gameId => {
      initialRecords[gameId] = {
        highScores: [],
        totalPlays: 0,
        lastPlayed: null,
      };
    });
    
    setGameRecords(initialRecords);
    localStorage.setItem('puzzleParadise_gameRecords', JSON.stringify(initialRecords));
  };
  
  // 컨텍스트 값 설정
  const contextValue = {
    gameRecords,
    saveGameRecord,
    getGameRecords,
    getAllHighScores,
    setPlayerName,
    getPlayerName,
    resetGameRecords,
    GAME_IDS,
  };
  
  return (
    <GameRecordContext.Provider value={contextValue}>
      {children}
    </GameRecordContext.Provider>
  );
};

// 커스텀 훅으로 컨텍스트 사용 간편화
export const useGameRecord = () => {
  const context = useContext(GameRecordContext);
  if (!context) {
    throw new Error('useGameRecord must be used within a GameRecordProvider');
  }
  return context;
}; 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameRecord } from '../contexts/GameRecordContext';
import AdComponent from './AdComponent';

function Leaderboard() {
  const { getAllHighScores, getGameRecords, GAME_IDS, getPlayerName, setPlayerName, resetGameRecords } = useGameRecord();
  const [selectedGame, setSelectedGame] = useState('all');
  const [newPlayerName, setNewPlayerName] = useState(getPlayerName());
  const [showNameInput, setShowNameInput] = useState(false);
  
  // 표시할 게임 기록 가져오기
  const scores = selectedGame === 'all' 
    ? getAllHighScores() 
    : getGameRecords(selectedGame).highScores.map(record => ({
        ...record,
        gameId: selectedGame,
        gameName: GAME_IDS[selectedGame]
      }));
  
  // 난이도 텍스트 변환
  const getDifficultyText = (difficulty) => {
    switch(difficulty) {
      case 0: return '쉬움';
      case 1: return '보통';
      case 2: return '어려움';
      default: return '알 수 없음';
    }
  };
  
  // 날짜 형식 변환
  const formatDate = (dateString) => {
    if (!dateString) return '없음';
    
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };
  
  // 플레이어 이름 저장
  const handleSavePlayerName = () => {
    if (newPlayerName.trim()) {
      setPlayerName(newPlayerName);
      setShowNameInput(false);
    }
  };
  
  // 기록 초기화 확인
  const handleResetConfirm = () => {
    if (window.confirm('모든 게임 기록을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      resetGameRecords();
    }
  };
  
  return (
    <div className="leaderboard-container">
      <h2>리더보드</h2>
      
      <div className="leaderboard-player-section">
        <div className="player-info">
          <h3>플레이어 정보</h3>
          {showNameInput ? (
            <div className="player-name-input">
              <input 
                type="text" 
                value={newPlayerName} 
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="플레이어 이름 입력"
                maxLength={20}
              />
              <button onClick={handleSavePlayerName} className="save-name-button">저장</button>
              <button onClick={() => setShowNameInput(false)} className="cancel-button">취소</button>
            </div>
          ) : (
            <div className="player-name-display">
              <p>현재 플레이어: <strong>{getPlayerName()}</strong></p>
              <button onClick={() => setShowNameInput(true)} className="edit-name-button">이름 변경</button>
            </div>
          )}
        </div>
        
        <div className="leaderboard-actions">
          <Link to="/" className="back-to-home">홈으로 돌아가기</Link>
          <button onClick={handleResetConfirm} className="reset-records-button">기록 초기화</button>
        </div>
      </div>
      
      <div className="game-selector">
        <h3>게임 선택</h3>
        <div className="game-filter-buttons">
          <button 
            className={selectedGame === 'all' ? 'selected' : ''} 
            onClick={() => setSelectedGame('all')}
          >
            전체 게임
          </button>
          {Object.keys(GAME_IDS).map(gameId => (
            <button
              key={gameId}
              className={selectedGame === gameId ? 'selected' : ''}
              onClick={() => setSelectedGame(gameId)}
            >
              {GAME_IDS[gameId]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="scores-table-container">
        <h3>{selectedGame === 'all' ? '전체 게임 최고 점수' : `${GAME_IDS[selectedGame]} 최고 점수`}</h3>
        
        {scores.length > 0 ? (
          <table className="scores-table">
            <thead>
              <tr>
                <th>순위</th>
                {selectedGame === 'all' && <th>게임</th>}
                <th>플레이어</th>
                <th>점수</th>
                <th>난이도</th>
                <th>날짜</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((record, index) => (
                <tr key={index} className={record.playerName === getPlayerName() ? 'current-player' : ''}>
                  <td>{index + 1}</td>
                  {selectedGame === 'all' && <td>{record.gameName}</td>}
                  <td>{record.playerName}</td>
                  <td>{record.score}</td>
                  <td>{getDifficultyText(record.difficulty)}</td>
                  <td>{formatDate(record.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-records">
            <p>아직 기록이 없습니다. 게임을 플레이하여 점수를 기록해보세요!</p>
          </div>
        )}
      </div>
      
      {/* 광고 배너 */}
      <div className="leaderboard-ad-banner">
        <AdComponent 
          adSlot="9876543211" // 실제 광고 슬롯 ID로 대체 필요
          format="horizontal"
          responsive={true}
        />
        <p className="ad-label">광고</p>
      </div>
    </div>
  );
}

export default Leaderboard; 
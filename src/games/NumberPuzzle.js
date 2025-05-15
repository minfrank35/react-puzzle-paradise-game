import React, { useState, useEffect } from 'react';

function NumberPuzzle({ difficulty, onUseHint, onGameEnd }) {
  // 난이도에 따른 보드 크기 설정
  const getBoardSize = () => {
    switch (difficulty) {
      case 0: return 3; // 3x3 퍼즐 (쉬움)
      case 1: return 4; // 4x4 퍼즐 (보통)
      case 2: return 5; // 5x5 퍼즐 (어려움)
      default: return 3;
    }
  };

  const size = getBoardSize();
  const totalTiles = size * size;
  
  // 게임 상태
  const [tiles, setTiles] = useState([]);
  const [emptyIndex, setEmptyIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [hintTile, setHintTile] = useState(null);
  
  // 타이머 설정
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);
  
  // 퍼즐 초기화
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // 게임 초기화 함수
  const initializeGame = () => {
    // 올바르게 정렬된 타일 생성
    const newTiles = Array.from({ length: totalTiles }, (_, i) => ({
      value: i === totalTiles - 1 ? null : i + 1,
      index: i,
    }));
    
    // 타일 섞기 (충분히 랜덤화)
    const shuffledTiles = shuffleTiles(newTiles);
    
    // 빈 타일 위치 저장
    const emptyTileIndex = shuffledTiles.findIndex(tile => tile.value === null);
    
    setTiles(shuffledTiles);
    setEmptyIndex(emptyTileIndex);
    setMoves(0);
    setTime(0);
    setIsRunning(true);
    setIsSolved(false);
    setHintTile(null);
  };
  
  // 타일 섞기 (충분히 많은 랜덤 이동으로)
  const shuffleTiles = (tilesArray) => {
    const shuffled = [...tilesArray];
    const gridSize = Math.sqrt(tilesArray.length);
    let emptyPos = tilesArray.length - 1; // 빈 타일 시작 위치
    
    // 150-300회 랜덤 이동
    const iterations = 150 + Math.floor(Math.random() * 150);
    
    for (let i = 0; i < iterations; i++) {
      // 빈 타일 주변의 이동 가능한 타일들
      const possibleMoves = [];
      
      // 위쪽 타일
      if (emptyPos >= gridSize) {
        possibleMoves.push(emptyPos - gridSize);
      }
      // 아래쪽 타일
      if (emptyPos < tilesArray.length - gridSize) {
        possibleMoves.push(emptyPos + gridSize);
      }
      // 왼쪽 타일
      if (emptyPos % gridSize !== 0) {
        possibleMoves.push(emptyPos - 1);
      }
      // 오른쪽 타일
      if (emptyPos % gridSize !== gridSize - 1) {
        possibleMoves.push(emptyPos + 1);
      }
      
      // 랜덤하게 하나의 이동 선택
      const moveIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      
      // 타일 교환
      [shuffled[emptyPos], shuffled[moveIndex]] = [shuffled[moveIndex], shuffled[emptyPos]];
      emptyPos = moveIndex;
    }
    
    // 풀 수 없는 퍼즐이 생성되지 않도록 확인 및 조정
    if (!isSolvable(shuffled, gridSize)) {
      // 첫 두 타일을 교환하여 풀 수 있게 만듦 (빈 타일 제외)
      const firstNonEmpty = shuffled.findIndex(tile => tile.value !== null);
      const secondNonEmpty = shuffled.findIndex((tile, idx) => idx > firstNonEmpty && tile.value !== null);
      
      [shuffled[firstNonEmpty], shuffled[secondNonEmpty]] = 
        [shuffled[secondNonEmpty], shuffled[firstNonEmpty]];
    }
    
    return shuffled;
  };
  
  // 퍼즐이 풀 수 있는지 확인 (인버전 수 기반)
  const isSolvable = (tiles, size) => {
    // 퍼즐 배열에서 값만 추출 (null은 0으로 처리)
    const values = tiles.map(tile => tile.value || 0);
    
    // 인버전 수 계산
    let inversions = 0;
    for (let i = 0; i < values.length - 1; i++) {
      for (let j = i + 1; j < values.length; j++) {
        if (values[i] > values[j] && values[i] !== 0 && values[j] !== 0) {
          inversions++;
        }
      }
    }
    
    // 빈 타일의 행 위치 (0-indexed)
    const emptyTileRow = Math.floor(tiles.findIndex(tile => tile.value === null) / size);
    
    // 홀수 크기의 퍼즐
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } 
    // 짝수 크기의 퍼즐
    else {
      return (inversions + emptyTileRow) % 2 === 1;
    }
  };
  
  // 타일 클릭 처리
  const handleTileClick = (index) => {
    if (isSolved) return;
    
    // 빈 타일과 현재 타일이 인접한지 확인
    if (isMovable(index)) {
      moveTile(index);
      
      // 힌트 초기화
      if (hintTile !== null) {
        setHintTile(null);
      }
      
      // 게임 시작 (첫 번째 이동)
      if (!isRunning) {
        setIsRunning(true);
      }
    }
  };
  
  // 이동 가능한 타일인지 확인
  const isMovable = (index) => {
    const size = Math.sqrt(tiles.length);
    
    // 위쪽 타일인지 확인
    if (index - size === emptyIndex) return true;
    // 아래쪽 타일인지 확인
    if (index + size === emptyIndex) return true;
    // 왼쪽 타일인지 확인 (같은 행에 있어야 함)
    if (index - 1 === emptyIndex && Math.floor(index / size) === Math.floor(emptyIndex / size)) return true;
    // 오른쪽 타일인지 확인 (같은 행에 있어야 함)
    if (index + 1 === emptyIndex && Math.floor(index / size) === Math.floor(emptyIndex / size)) return true;
    
    return false;
  };
  
  // 타일 이동
  const moveTile = (index) => {
    const newTiles = [...tiles];
    
    // 타일 교환
    [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
    
    setTiles(newTiles);
    setEmptyIndex(index);
    setMoves(moves + 1);
    
    // 퍼즐이 풀렸는지 확인
    checkIfSolved(newTiles);
  };
  
  // 퍼즐이 풀렸는지 확인
  const checkIfSolved = (currentTiles) => {
    // 마지막 타일이 빈 타일이어야 함
    if (currentTiles[currentTiles.length - 1].value !== null) return;
    
    // 나머지 타일이 순서대로 정렬되어 있는지 확인
    for (let i = 0; i < currentTiles.length - 1; i++) {
      if (currentTiles[i].value !== i + 1) return;
    }
    
    // 풀린 상태
    setIsSolved(true);
    setIsRunning(false);
    
    // 점수 계산 및 게임 종료
    setTimeout(() => {
      const score = calculateScore();
      onGameEnd(score);
    }, 1500);
  };
  
  // 점수 계산
  const calculateScore = () => {
    const baseScore = 1000;
    const timeDeduction = Math.min(time * 2, 700); // 시간에 따른 감점
    const movesDeduction = Math.min(moves * 5, 500); // 이동 횟수에 따른 감점
    const difficultyBonus = difficulty * 500; // 난이도에 따른 추가 점수
    
    return Math.max(baseScore - timeDeduction - movesDeduction + difficultyBonus, 100);
  };
  
  // 힌트 사용
  const handleUseHint = () => {
    if (onUseHint()) {
      // 현재 위치와 올바른 위치가 가장 크게 차이나는 타일 찾기
      let maxDistance = -1;
      let targetTile = null;
      
      tiles.forEach((tile, index) => {
        if (tile.value) {
          // 타일 값 - 1이 올바른 위치
          const correctPos = tile.value - 1;
          // 현재 위치와 올바른 위치 사이의 맨해튼 거리 계산
          const currentRow = Math.floor(index / size);
          const currentCol = index % size;
          const correctRow = Math.floor(correctPos / size);
          const correctCol = correctPos % size;
          const distance = Math.abs(currentRow - correctRow) + Math.abs(currentCol - correctCol);
          
          if (distance > maxDistance) {
            maxDistance = distance;
            targetTile = index;
          }
        }
      });
      
      // 힌트 표시
      setHintTile(targetTile);
      
      // 잠시 후 힌트 제거
      setTimeout(() => {
        setHintTile(null);
      }, 3000);
    }
  };
  
  // 시간 형식 변환
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="number-puzzle-game">
      <div className="game-info">
        <div className="game-stats">
          <div>시간: {formatTime(time)}</div>
          <div>이동: {moves}</div>
        </div>
        
        <button onClick={handleUseHint} className="hint-button">
          힌트 사용
        </button>
        
        <button onClick={initializeGame} className="restart-button">
          재시작
        </button>
      </div>
      
      <div 
        className="puzzle-board"
        style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`
        }}
      >
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`puzzle-tile ${tile.value === null ? 'empty' : ''} ${index === hintTile ? 'hint' : ''} ${isMovable(index) ? 'movable' : ''}`}
            onClick={() => tile.value !== null && handleTileClick(index)}
          >
            {tile.value}
          </div>
        ))}
      </div>
      
      {isSolved && (
        <div className="game-over-modal">
          <h3>퍼즐 완성!</h3>
          <p>이동 횟수: {moves}</p>
          <p>시간: {formatTime(time)}</p>
        </div>
      )}
    </div>
  );
}

export default NumberPuzzle; 
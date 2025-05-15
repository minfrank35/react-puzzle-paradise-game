import React, { useState, useEffect } from 'react';

function ColorSort({ difficulty, onUseHint, onGameEnd }) {
  // 난이도에 따른 설정
  const getDifficultySettings = () => {
    switch (difficulty) {
      case 0: return { colors: 6, tubes: 4 }; // 쉬움
      case 1: return { colors: 8, tubes: 5 }; // 보통
      case 2: return { colors: 10, tubes: 6 }; // 어려움
      default: return { colors: 6, tubes: 4 };
    }
  };
  
  const { colors, tubes } = getDifficultySettings();
  
  // 게임 상태
  const [colorTubes, setColorTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [hintTubes, setHintTubes] = useState(null);
  
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
  
  // 게임 초기화
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // 색상 목록 생성 (HSL 사용)
  const generateColors = (count) => {
    const colorList = [];
    const step = 360 / count;
    
    for (let i = 0; i < count; i++) {
      const hue = Math.floor(i * step);
      colorList.push(`hsl(${hue}, 75%, 60%)`);
    }
    
    return colorList;
  };
  
  // 게임 초기화
  const initializeGame = () => {
    const colorList = generateColors(colors);
    const tubeHeight = 4; // 각 튜브에 들어갈 색상 블록 개수
    const emptyTubes = 2; // 비어있는 튜브 수
    
    // 색상 블록 생성 (각 색상당 튜브높이만큼)
    let allBlocks = [];
    colorList.forEach(color => {
      for (let i = 0; i < tubeHeight; i++) {
        allBlocks.push(color);
      }
    });
    
    // 색상 블록 섞기
    for (let i = allBlocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allBlocks[i], allBlocks[j]] = [allBlocks[j], allBlocks[i]];
    }
    
    // 튜브에 블록 분배
    const newTubes = [];
    
    // 색상이 들어있는 튜브
    for (let i = 0; i < colors; i++) {
      const tubeBlocks = allBlocks.slice(i * tubeHeight, (i + 1) * tubeHeight);
      newTubes.push(tubeBlocks);
    }
    
    // 빈 튜브 추가
    for (let i = 0; i < emptyTubes; i++) {
      newTubes.push([]);
    }
    
    setColorTubes(newTubes);
    setSelectedTube(null);
    setMoves(0);
    setTime(0);
    setIsRunning(true);
    setIsSolved(false);
    setHintTubes(null);
  };
  
  // 튜브 선택 처리
  const handleTubeClick = (tubeIndex) => {
    if (isSolved) return;
    
    // 힌트 초기화
    if (hintTubes) {
      setHintTubes(null);
    }
    
    if (selectedTube === null) {
      // 첫 번째 튜브 선택 (비어있지 않은 경우에만)
      if (colorTubes[tubeIndex].length > 0) {
        setSelectedTube(tubeIndex);
      }
    } else {
      // 두 번째 튜브 선택 - 이동 시도
      if (selectedTube !== tubeIndex) {
        moveColor(selectedTube, tubeIndex);
      }
      // 같은 튜브 선택 시 선택 취소
      setSelectedTube(null);
    }
  };
  
  // 색상 이동
  const moveColor = (fromIndex, toIndex) => {
    const fromTube = [...colorTubes[fromIndex]];
    const toTube = [...colorTubes[toIndex]];
    
    // 튜브가 가득 찼는지 확인
    if (toTube.length >= 4) return;
    
    // 이동할 색상
    const colorToMove = fromTube[fromTube.length - 1];
    
    // 빈 튜브이거나 같은 색상 위에만 놓을 수 있음
    if (toTube.length === 0 || toTube[toTube.length - 1] === colorToMove) {
      // 색상 이동
      toTube.push(colorToMove);
      fromTube.pop();
      
      // 튜브 상태 업데이트
      const newTubes = [...colorTubes];
      newTubes[fromIndex] = fromTube;
      newTubes[toIndex] = toTube;
      
      setColorTubes(newTubes);
      setMoves(moves + 1);
      
      // 게임 승리 조건 확인
      checkWinCondition(newTubes);
    }
  };
  
  // 승리 조건 확인
  const checkWinCondition = (currentTubes) => {
    // 각 튜브가 비어있거나 같은 색상으로만 채워져 있어야 함
    const solved = currentTubes.every(tube => {
      // 비어있으면 통과
      if (tube.length === 0) return true;
      
      // 꽉 찬 상태인지 확인 (4개)
      if (tube.length !== 4) return false;
      
      // 모든 색상이 동일한지 확인
      const firstColor = tube[0];
      return tube.every(color => color === firstColor);
    });
    
    if (solved) {
      setIsSolved(true);
      setIsRunning(false);
      
      // 점수 계산 및 게임 종료
      setTimeout(() => {
        const score = calculateScore();
        onGameEnd(score);
      }, 1500);
    }
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
    if (isSolved) return;
    
    if (onUseHint()) {
      // 유효한 이동이 가능한 튜브 쌍 찾기
      const hintPair = findBestMove();
      if (hintPair) {
        setHintTubes(hintPair);
        
        // 3초 후 힌트 제거
        setTimeout(() => {
          setHintTubes(null);
        }, 3000);
      }
    }
  };
  
  // 최적의 이동 찾기
  const findBestMove = () => {
    for (let fromIdx = 0; fromIdx < colorTubes.length; fromIdx++) {
      const fromTube = colorTubes[fromIdx];
      if (fromTube.length === 0) continue;
      
      // 이동할 색상
      const colorToMove = fromTube[fromTube.length - 1];
      
      for (let toIdx = 0; toIdx < colorTubes.length; toIdx++) {
        if (fromIdx === toIdx) continue;
        
        const toTube = colorTubes[toIdx];
        
        // 빈 튜브이거나 같은 색상 튜브면 이동 가능
        if (toTube.length < 4 && (toTube.length === 0 || toTube[toTube.length - 1] === colorToMove)) {
          return { from: fromIdx, to: toIdx };
        }
      }
    }
    
    return null;
  };
  
  // 시간 형식 변환
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="color-sort-game">
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
      
      <div className="color-tubes-container">
        {colorTubes.map((tube, index) => (
          <div 
            key={index}
            className={`color-tube ${selectedTube === index ? 'selected' : ''} ${hintTubes?.from === index || hintTubes?.to === index ? 'hint' : ''}`}
            onClick={() => handleTubeClick(index)}
          >
            <div className="tube-glass">
              {/* 비어있는 공간 */}
              {Array.from({ length: 4 - tube.length }).map((_, i) => (
                <div key={`empty-${i}`} className="color-block empty"></div>
              ))}
              
              {/* 색상 블록 */}
              {tube.map((color, i) => (
                <div 
                  key={`color-${i}`} 
                  className="color-block" 
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
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

export default ColorSort; 
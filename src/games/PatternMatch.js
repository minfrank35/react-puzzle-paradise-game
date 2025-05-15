import React, { useState, useEffect } from 'react';

function PatternMatch({ difficulty, onUseHint, onGameEnd }) {
  // 난이도에 따른 설정
  const getDifficultySettings = () => {
    switch (difficulty) {
      case 0: return { gridSize: 4, patternLength: 6 }; // 쉬움
      case 1: return { gridSize: 5, patternLength: 8 }; // 보통
      case 2: return { gridSize: 6, patternLength: 10 }; // 어려움
      default: return { gridSize: 4, patternLength: 6 };
    }
  };
  
  const { gridSize, patternLength } = getDifficultySettings();
  
  // 게임 상태
  const [grid, setGrid] = useState([]);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [isDisplayingPattern, setIsDisplayingPattern] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
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

  // 게임 초기화 함수
  const initializeGame = () => {
    // 그리드 생성
    const newGrid = Array(gridSize).fill().map(() => 
      Array(gridSize).fill().map(() => ({
        color: getRandomColor(),
        isActive: false,
        isHint: false
      }))
    );
    
    setGrid(newGrid);
    setPattern([]);
    setUserPattern([]);
    setIsDisplayingPattern(false);
    setLevel(1);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setTime(0);
    
    // 첫 패턴 생성 및 표시
    setTimeout(() => {
      generatePattern(1);
    }, 1000);
  };
  
  // 랜덤 색상 생성
  const getRandomColor = () => {
    const colors = [
      'var(--primary-color)',
      'var(--secondary-color)',
      'var(--accent-color)',
      'var(--success-color)',
      'var(--warning-color)',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // 패턴 생성
  const generatePattern = (currentLevel) => {
    const length = Math.min(currentLevel + 2, patternLength);
    const newPattern = [];
    
    for (let i = 0; i < length; i++) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      newPattern.push({ x, y });
    }
    
    setPattern(newPattern);
    setUserPattern([]);
    
    // 패턴 표시
    setIsDisplayingPattern(true);
    setIsRunning(false);
    
    // 패턴을 순차적으로 표시
    newPattern.forEach((p, index) => {
      setTimeout(() => {
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          
          // 이전 포인트 리셋
          if (index > 0) {
            const prevPoint = newPattern[index - 1];
            newGrid[prevPoint.y][prevPoint.x] = {
              ...newGrid[prevPoint.y][prevPoint.x],
              isActive: false
            };
          }
          
          // 현재 포인트 활성화
          newGrid[p.y][p.x] = {
            ...newGrid[p.y][p.x],
            isActive: true
          };
          
          return newGrid;
        });
      }, (index + 1) * 800);
    });
    
    // 패턴 표시 완료 후 사용자 입력 활성화
    setTimeout(() => {
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        pattern.forEach(p => {
          newGrid[p.y][p.x] = {
            ...newGrid[p.y][p.x],
            isActive: false
          };
        });
        return newGrid;
      });
      
      setIsDisplayingPattern(false);
      setIsRunning(true);
    }, (newPattern.length + 1) * 800);
  };
  
  // 셀 클릭 처리
  const handleCellClick = (x, y) => {
    if (isDisplayingPattern || gameOver || gameWon) return;
    
    // 클릭한 셀 활성화
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      newGrid[y][x] = {
        ...newGrid[y][x],
        isActive: true
      };
      return newGrid;
    });
    
    // 사용자 패턴에 추가
    const newUserPattern = [...userPattern, { x, y }];
    setUserPattern(newUserPattern);
    
    // 잠시 후 셀 비활성화
    setTimeout(() => {
      setGrid(prevGrid => {
        const newGrid = [...prevGrid];
        newGrid[y][x] = {
          ...newGrid[y][x],
          isActive: false
        };
        return newGrid;
      });
    }, 300);
    
    // 현재 입력이 올바른지 확인
    const currentIndex = userPattern.length;
    if (x !== pattern[currentIndex].x || y !== pattern[currentIndex].y) {
      // 실패
      handleGameOver();
      return;
    }
    
    // 모든 패턴을 맞췄는지 확인
    if (newUserPattern.length === pattern.length) {
      // 점수 추가
      const levelScore = level * 100 * (1 + difficulty * 0.5);
      setScore(prevScore => prevScore + levelScore);
      
      // 최대 레벨 도달 확인
      if (level >= 5) {
        // 게임 승리
        handleGameWin();
      } else {
        // 다음 레벨
        setLevel(prevLevel => prevLevel + 1);
        
        // 잠시 후 다음 패턴 생성
        setTimeout(() => {
          generatePattern(level + 1);
        }, 1000);
      }
    }
  };
  
  // 게임 오버 처리
  const handleGameOver = () => {
    setGameOver(true);
    setIsRunning(false);
    
    // 틀린 패턴 표시
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      pattern.forEach(p => {
        newGrid[p.y][p.x] = {
          ...newGrid[p.y][p.x],
          isActive: true
        };
      });
      return newGrid;
    });
    
    // 2초 후 점수 계산 및 게임 종료
    setTimeout(() => {
      const finalScore = calculateScore();
      onGameEnd(finalScore);
    }, 2000);
  };
  
  // 게임 승리 처리
  const handleGameWin = () => {
    setGameWon(true);
    setIsRunning(false);
    
    // 승리 효과 표시
    setGrid(prevGrid => {
      const newGrid = [...prevGrid];
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          newGrid[y][x] = {
            ...newGrid[y][x],
            isActive: true
          };
        }
      }
      return newGrid;
    });
    
    // 2초 후 점수 계산 및 게임 종료
    setTimeout(() => {
      const finalScore = calculateScore();
      onGameEnd(finalScore);
    }, 2000);
  };
  
  // 점수 계산
  const calculateScore = () => {
    const baseScore = score;
    const timeBonus = Math.max(1000 - time * 10, 0);
    const difficultyBonus = difficulty * 500;
    
    return Math.max(baseScore + timeBonus + difficultyBonus, 100);
  };
  
  // 힌트 사용
  const handleUseHint = () => {
    if (isDisplayingPattern || gameOver || gameWon) return;
    
    if (onUseHint()) {
      // 다음 입력해야 할 패턴 위치 힌트 표시
      const nextIndex = userPattern.length;
      
      if (nextIndex < pattern.length) {
        const { x, y } = pattern[nextIndex];
        
        // 힌트 표시
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[y][x] = {
            ...newGrid[y][x],
            isHint: true
          };
          return newGrid;
        });
        
        // 2초 후 힌트 제거
        setTimeout(() => {
          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            newGrid[y][x] = {
              ...newGrid[y][x],
              isHint: false
            };
            return newGrid;
          });
        }, 2000);
      }
    }
  };
  
  // 시간 형식 변환
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="pattern-match-game">
      <div className="game-info">
        <div className="game-stats">
          <div>레벨: {level}/5</div>
          <div>점수: {score}</div>
          <div>시간: {formatTime(time)}</div>
        </div>
        
        <button 
          onClick={handleUseHint} 
          className="hint-button" 
          disabled={isDisplayingPattern || gameOver || gameWon}
        >
          힌트 사용
        </button>
        
        <button onClick={initializeGame} className="restart-button">
          재시작
        </button>
      </div>
      
      <div className={`pattern-grid size-${gridSize} ${isDisplayingPattern ? 'displaying' : ''}`}>
        {grid.map((row, y) => (
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className={`pattern-cell ${cell.isActive ? 'active' : ''} ${cell.isHint ? 'hint' : ''}`}
              style={{ backgroundColor: cell.color }}
              onClick={() => handleCellClick(x, y)}
            />
          ))
        ))}
      </div>
      
      <div className="pattern-progress">
        <div className="pattern-indicator">
          {pattern.map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index < userPattern.length ? 'filled' : ''}`}
            />
          ))}
        </div>
        <p className="pattern-status">
          {isDisplayingPattern ? '패턴을 기억하세요...' : 
           gameOver ? '실패! 올바른 패턴을 확인하세요.' :
           gameWon ? '성공! 모든 레벨을 클리어했습니다.' :
           '패턴을 순서대로 클릭하세요.'}
        </p>
      </div>
      
      {(gameOver || gameWon) && (
        <div className="game-over-modal">
          <h3>{gameWon ? '게임 승리!' : '게임 오버'}</h3>
          <p>레벨: {level}/5</p>
          <p>점수: {score}</p>
          <p>시간: {formatTime(time)}</p>
        </div>
      )}
    </div>
  );
}

export default PatternMatch; 
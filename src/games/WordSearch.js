import React, { useState, useEffect } from 'react';

function WordSearch({ difficulty, onUseHint, onGameEnd }) {
  // 난이도에 따른 그리드 크기 설정
  const getGridSize = () => {
    switch (difficulty) {
      case 0: return { size: 8, wordCount: 5 }; // 쉬움
      case 1: return { size: 10, wordCount: 8 }; // 보통
      case 2: return { size: 12, wordCount: 12 }; // 어려움
      default: return { size: 8, wordCount: 5 };
    }
  };
  
  const { size, wordCount } = getGridSize();
  
  // 단어 목록 (한국어, 영어 혼합)
  const wordPool = [
    '사과', '바나나', '딸기', '수박', '포도', '참외', '키위', '오렌지',
    '컴퓨터', '스마트폰', '태블릿', '노트북', '키보드', '마우스', '모니터',
    '강아지', '고양이', '코끼리', '사자', '호랑이', '기린', '원숭이', '팬더',
    'APPLE', 'BANANA', 'ORANGE', 'PUZZLE', 'GAME', 'PHONE', 'MUSIC', 'VIDEO',
    'HAPPY', 'COLOR', 'WATER', 'EARTH', 'SPACE', 'LIGHT', 'DREAM', 'SMILE'
  ];
  
  // 게임 상태
  const [grid, setGrid] = useState([]);
  const [words, setWords] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selection, setSelection] = useState({ start: null, current: null, end: null });
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [moves, setMoves] = useState(0);
  const [hintWord, setHintWord] = useState(null);
  
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
    // 랜덤 단어 선택
    const selectedWords = selectRandomWords(wordCount);
    
    // 게임 그리드 생성
    const { newGrid, placedWords } = createGrid(selectedWords);
    
    setGrid(newGrid);
    setWords(placedWords);
    setFoundWords([]);
    setSelection({ start: null, current: null, end: null });
    setTime(0);
    setIsRunning(true);
    setMoves(0);
    setHintWord(null);
  };
  
  // 랜덤 단어 선택
  const selectRandomWords = (count) => {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // 그리드 생성 및 단어 배치
  const createGrid = (words) => {
    // 빈 그리드 초기화
    const newGrid = Array(size).fill().map(() => Array(size).fill(''));
    const placedWords = [];
    
    // 각 단어 배치 시도
    words.forEach(word => {
      const maxAttempts = 100;
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // 방향 랜덤 선택 (가로, 세로, 대각선)
        const directions = [
          { x: 1, y: 0 },   // 가로 (오른쪽)
          { x: 0, y: 1 },   // 세로 (아래쪽)
          { x: 1, y: 1 },   // 대각선 (오른쪽 아래)
          { x: 1, y: -1 },  // 대각선 (오른쪽 위)
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        // 시작 위치 랜덤 선택
        let startX = Math.floor(Math.random() * size);
        let startY = Math.floor(Math.random() * size);
        
        // 단어가 그리드에 맞는지 확인
        if (direction.x === 1 && startX + word.length > size) {
          startX = size - word.length;
        }
        if (direction.x === -1 && startX - word.length < -1) {
          startX = word.length - 1;
        }
        if (direction.y === 1 && startY + word.length > size) {
          startY = size - word.length;
        }
        if (direction.y === -1 && startY - word.length < -1) {
          startY = word.length - 1;
        }
        
        // 배치가 가능한지 확인
        let canPlace = true;
        const cellsToFill = [];
        
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * direction.x;
          const y = startY + i * direction.y;
          
          // 그리드 범위 체크
          if (x < 0 || x >= size || y < 0 || y >= size) {
            canPlace = false;
            break;
          }
          
          // 이미 채워진 셀 확인
          if (newGrid[y][x] !== '' && newGrid[y][x] !== word[i]) {
            canPlace = false;
            break;
          }
          
          cellsToFill.push({ x, y, letter: word[i] });
        }
        
        // 단어 배치
        if (canPlace) {
          cellsToFill.forEach(cell => {
            newGrid[cell.y][cell.x] = cell.letter;
          });
          
          placedWords.push({
            word,
            start: { x: startX, y: startY },
            end: { 
              x: startX + (word.length - 1) * direction.x, 
              y: startY + (word.length - 1) * direction.y 
            },
            found: false
          });
          
          placed = true;
        }
      }
    });
    
    // 빈 셀을 랜덤 문자로 채우기
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (newGrid[y][x] === '') {
          // 한글과 영어 문자 랜덤 선택
          if (Math.random() < 0.5) {
            // 한글 랜덤 문자
            const charCode = 44032 + Math.floor(Math.random() * 11172);
            newGrid[y][x] = String.fromCharCode(charCode);
          } else {
            // 영어 랜덤 문자
            const charCode = 65 + Math.floor(Math.random() * 26);
            newGrid[y][x] = String.fromCharCode(charCode);
          }
        }
      }
    }
    
    return { newGrid, placedWords };
  };
  
  // 셀 클릭 처리
  const handleCellMouseDown = (x, y) => {
    if (!isRunning) return;
    
    setSelection({
      start: { x, y },
      current: { x, y },
      end: null
    });
  };
  
  // 마우스 이동 처리
  const handleCellMouseEnter = (x, y) => {
    if (!selection.start) return;
    
    setSelection({
      ...selection,
      current: { x, y }
    });
  };
  
  // 마우스 업 처리
  const handleCellMouseUp = (x, y) => {
    if (!selection.start) return;
    
    const end = { x, y };
    setSelection({
      ...selection,
      end
    });
    
    // 선택 확인
    checkSelection(selection.start, end);
  };
  
  // 선택한 단어 확인
  const checkSelection = (start, end) => {
    // 상하좌우/대각선 방향인지 확인
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // 직선이 아닌 경우 무시
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
      resetSelection();
      return;
    }
    
    // 방향 계산
    const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
    
    // 선택한 문자 추출
    let selectedWord = '';
    let length = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
    
    for (let i = 0; i < length; i++) {
      const x = start.x + i * dirX;
      const y = start.y + i * dirY;
      selectedWord += grid[y][x];
    }
    
    // 거꾸로 선택된 경우 뒤집기
    if ((dirX < 0 || (dirX === 0 && dirY < 0))) {
      selectedWord = selectedWord.split('').reverse().join('');
    }
    
    // 이미 찾은 단어인지 확인
    if (foundWords.includes(selectedWord)) {
      resetSelection();
      return;
    }
    
    // 단어 목록에서 확인
    const foundWordIndex = words.findIndex(
      w => w.word === selectedWord && !w.found
    );
    
    if (foundWordIndex !== -1) {
      // 단어 찾음
      const updatedWords = [...words];
      updatedWords[foundWordIndex].found = true;
      
      setWords(updatedWords);
      setFoundWords([...foundWords, selectedWord]);
      setMoves(moves + 1);
      
      // 모든 단어를 찾았는지 확인
      if (foundWords.length + 1 === words.length) {
        // 게임 종료
        setIsRunning(false);
        
        // 점수 계산 및 게임 종료
        setTimeout(() => {
          const score = calculateScore();
          onGameEnd(score);
        }, 1500);
      }
    }
    
    resetSelection();
  };
  
  // 선택 초기화
  const resetSelection = () => {
    setSelection({ start: null, current: null, end: null });
  };
  
  // 점수 계산
  const calculateScore = () => {
    const baseScore = 1000;
    const timeDeduction = Math.min(time * 2, 700); // 시간에 따른 감점
    const movesBonus = wordCount * 50; // 찾은 단어 수에 따른 추가 점수
    const difficultyBonus = difficulty * 500; // 난이도에 따른 추가 점수
    
    return Math.max(baseScore - timeDeduction + movesBonus + difficultyBonus, 100);
  };
  
  // 힌트 사용
  const handleUseHint = () => {
    if (!isRunning) return;
    
    if (onUseHint()) {
      // 아직 찾지 못한 단어 중 하나 선택
      const unFoundWords = words.filter(w => !w.found);
      
      if (unFoundWords.length > 0) {
        const randomWord = unFoundWords[Math.floor(Math.random() * unFoundWords.length)];
        setHintWord(randomWord);
        
        // 3초 후 힌트 제거
        setTimeout(() => {
          setHintWord(null);
        }, 3000);
      }
    }
  };
  
  // 단어가 하이라이트되어야 하는지 확인
  const isCellHighlighted = (x, y) => {
    // 현재 선택 중인 셀
    if (selection.start && selection.current) {
      // 방향 계산
      const dx = selection.current.x - selection.start.x;
      const dy = selection.current.y - selection.start.y;
      
      // 직선이 아닌 경우
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
        return x === selection.start.x && y === selection.start.y;
      }
      
      // 방향 계산
      const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      
      // 선택 영역 내부인지 확인
      const length = Math.max(Math.abs(dx), Math.abs(dy));
      
      for (let i = 0; i <= length; i++) {
        const checkX = selection.start.x + i * dirX;
        const checkY = selection.start.y + i * dirY;
        
        if (x === checkX && y === checkY) {
          return true;
        }
      }
    }
    
    // 찾은 단어의 셀인지 확인
    for (const wordObj of words) {
      if (wordObj.found) {
        const { start, end } = wordObj;
        
        // 방향 계산
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        
        const length = Math.max(Math.abs(dx), Math.abs(dy));
        
        for (let i = 0; i <= length; i++) {
          const checkX = start.x + i * dirX;
          const checkY = start.y + i * dirY;
          
          if (x === checkX && y === checkY) {
            return true;
          }
        }
      }
    }
    
    // 힌트 단어의 셀인지 확인
    if (hintWord) {
      const { start, end } = hintWord;
      
      // 방향 계산
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      
      const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      
      const length = Math.max(Math.abs(dx), Math.abs(dy));
      
      for (let i = 0; i <= length; i++) {
        const checkX = start.x + i * dirX;
        const checkY = start.y + i * dirY;
        
        if (x === checkX && y === checkY) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  // 셀 스타일 계산
  const getCellStyle = (x, y) => {
    if (hintWord) {
      const { start, end } = hintWord;
      
      // 방향 계산
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      
      const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
      const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
      
      const length = Math.max(Math.abs(dx), Math.abs(dy));
      
      for (let i = 0; i <= length; i++) {
        const checkX = start.x + i * dirX;
        const checkY = start.y + i * dirY;
        
        if (x === checkX && y === checkY) {
          return { backgroundColor: 'var(--warning-color)', color: 'var(--text-dark)' };
        }
      }
    }
    
    // 찾은 단어의 셀인지 확인
    for (const wordObj of words) {
      if (wordObj.found) {
        const { start, end } = wordObj;
        
        // 방향 계산
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        const dirX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const dirY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        
        const length = Math.max(Math.abs(dx), Math.abs(dy));
        
        for (let i = 0; i <= length; i++) {
          const checkX = start.x + i * dirX;
          const checkY = start.y + i * dirY;
          
          if (x === checkX && y === checkY) {
            return { backgroundColor: 'var(--success-color)', color: 'var(--text-light)' };
          }
        }
      }
    }
    
    // 현재 선택 중인 셀
    if (isCellHighlighted(x, y)) {
      return { backgroundColor: 'var(--primary-color)', color: 'var(--text-light)' };
    }
    
    return {};
  };
  
  // 시간 형식 변환
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="word-search-game"
      onMouseLeave={resetSelection}
      onMouseUp={() => handleCellMouseUp(selection.current?.x, selection.current?.y)}
    >
      <div className="game-info">
        <div className="game-stats">
          <div>시간: {formatTime(time)}</div>
          <div>찾은 단어: {foundWords.length}/{words.length}</div>
        </div>
        
        <button onClick={handleUseHint} className="hint-button">
          힌트 사용
        </button>
        
        <button onClick={initializeGame} className="restart-button">
          재시작
        </button>
      </div>
      
      <div className="word-grid"
        style={{ 
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          gridTemplateRows: `repeat(${size}, 1fr)`
        }}
      >
        {grid.map((row, y) => (
          row.map((letter, x) => (
            <div
              key={`${x}-${y}`}
              className="word-cell"
              style={getCellStyle(x, y)}
              onMouseDown={() => handleCellMouseDown(x, y)}
              onMouseEnter={() => handleCellMouseEnter(x, y)}
            >
              {letter}
            </div>
          ))
        ))}
      </div>
      
      <div className="word-list">
        <h3>찾을 단어:</h3>
        <div className="word-list-items">
          {words.map((wordObj, index) => (
            <div key={index} 
              className={`word-item ${wordObj.found ? 'found' : ''} ${hintWord?.word === wordObj.word ? 'hint' : ''}`}>
              {wordObj.word}
            </div>
          ))}
        </div>
      </div>
      
      {foundWords.length === words.length && (
        <div className="game-over-modal">
          <h3>모든 단어를 찾았습니다!</h3>
          <p>찾은 단어: {foundWords.length}</p>
          <p>시간: {formatTime(time)}</p>
        </div>
      )}
    </div>
  );
}

export default WordSearch; 
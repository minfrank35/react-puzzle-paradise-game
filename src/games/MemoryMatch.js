import React, { useState, useEffect } from 'react';

// 카드 이미지 배열 (실제로는 더 많은 이미지가 필요할 것입니다)
const cardImages = [
  '🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🍒', '🥝',
  '🍍', '🥭', '🍑', '🍐', '🥥', '🍋', '🍈', '🍏',
  '🌮', '🍕', '🍔', '🍟', '🥪', '🥗', '🍦', '🍩',
  '🐱', '🐶', '🐼', '🦊', '🐵', '🦁', '🐯', '🐰'
];

function MemoryMatch({ difficulty, onUseHint, onGameEnd }) {
  // 난이도에 따른 보드 크기 설정
  const getBoardSize = () => {
    switch (difficulty) {
      case 0: return { rows: 4, cols: 4 }; // 4x4 = 16 cards (8 pairs)
      case 1: return { rows: 6, cols: 6 }; // 6x6 = 36 cards (18 pairs)
      case 2: return { rows: 8, cols: 8 }; // 8x8 = 64 cards (32 pairs)
      default: return { rows: 4, cols: 4 };
    }
  };
  
  const { rows, cols } = getBoardSize();
  const totalPairs = (rows * cols) / 2;
  
  // 게임 상태
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  
  // 타이머 설정
  useEffect(() => {
    let timerInterval;
    
    if (gameStartTime && !gameOver) {
      timerInterval = setInterval(() => {
        setGameTime(Math.floor((Date.now() - gameStartTime) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(timerInterval);
  }, [gameStartTime, gameOver]);
  
  // 게임 초기화
  useEffect(() => {
    initializeGame();
  }, [difficulty]);
  
  // 게임 종료 체크
  useEffect(() => {
    if (matchedPairs.length === totalPairs && totalPairs > 0) {
      setGameOver(true);
      
      // 점수 계산 (시간과 이동 횟수 기반)
      const timeBonus = Math.max(1000 - gameTime * 5, 0);
      const movesPenalty = moves * 5;
      const difficultyBonus = difficulty * 500 + 500;
      const score = difficultyBonus + timeBonus - movesPenalty;
      
      // 게임 종료 콜백 호출
      setTimeout(() => {
        onGameEnd(Math.max(score, 0));
      }, 1500);
    }
  }, [matchedPairs, totalPairs, difficulty, gameTime, moves, onGameEnd]);
  
  // 게임 초기화 함수
  const initializeGame = () => {
    const { rows, cols } = getBoardSize();
    const totalCards = rows * cols;
    const pairsNeeded = totalCards / 2;
    
    // 필요한 만큼의 카드 쌍 선택
    const selectedImages = cardImages.slice(0, pairsNeeded);
    
    // 카드 쌍 생성 및 섞기
    let newCards = [];
    for (let i = 0; i < pairsNeeded; i++) {
      newCards.push({
        id: i * 2,
        image: selectedImages[i],
        isFlipped: false,
        isMatched: false
      });
      newCards.push({
        id: i * 2 + 1,
        image: selectedImages[i],
        isFlipped: false,
        isMatched: false
      });
    }
    
    // 카드 섞기
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    
    setCards(newCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setMoves(0);
    setGameStartTime(Date.now());
    setGameTime(0);
    setGameOver(false);
  };
  
  // 카드 클릭 처리
  const handleCardClick = (index) => {
    // 이미 뒤집혔거나 매치된 카드는 무시
    if (
      cards[index].isFlipped ||
      cards[index].isMatched ||
      flippedIndices.length >= 2
    ) {
      return;
    }
    
    // 카드 뒤집기
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    // 뒤집힌 카드 인덱스 추가
    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);
    
    // 2장의 카드가 뒤집혔으면 매치 확인
    if (newFlippedIndices.length === 2) {
      const [firstIndex, secondIndex] = newFlippedIndices;
      
      // 이동 횟수 증가
      setMoves(moves + 1);
      
      // 두 카드가 일치하는지 확인
      if (cards[firstIndex].image === cards[secondIndex].image) {
        // 일치하면 매치 상태로 변경
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setMatchedPairs([...matchedPairs, cards[firstIndex].image]);
          setFlippedIndices([]);
        }, 500);
      } else {
        // 일치하지 않으면 다시 뒤집기
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };
  
  // 힌트 사용
  const handleUseHint = () => {
    if (onUseHint()) {
      // 힌트로 무작위 매치 쌍 하나 공개 (아직 매치되지 않은 것 중에서)
      const unmatched = cards.filter(card => !card.isMatched);
      if (unmatched.length >= 2) {
        // 매치되지 않은 카드들의 이미지 추출
        const unmatchedImages = [...new Set(unmatched.map(card => card.image))];
        
        // 랜덤 이미지 선택
        const randomImage = unmatchedImages[Math.floor(Math.random() * unmatchedImages.length)];
        
        // 선택된 이미지를 가진 카드들의 인덱스 찾기
        const hintIndices = cards
          .map((card, index) => ({ index, image: card.image }))
          .filter(card => card.image === randomImage && !cards[card.index].isMatched)
          .map(card => card.index);
        
        // 힌트 카드 표시
        const newCards = [...cards];
        hintIndices.forEach(index => {
          newCards[index].isFlipped = true;
        });
        setCards(newCards);
        
        // 잠시 후 다시 뒤집기
        setTimeout(() => {
          const resetCards = [...cards];
          hintIndices.forEach(index => {
            resetCards[index].isFlipped = false;
          });
          setCards(resetCards);
        }, 1500);
      }
    }
  };
  
  // 타이머 형식 변환
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  return (
    <div className="memory-match-game">
      <div className="game-info">
        <div className="game-stats">
          <div>시간: {formatTime(gameTime)}</div>
          <div>이동: {moves}</div>
          <div>찾은 쌍: {matchedPairs.length} / {totalPairs}</div>
        </div>
        
        <button onClick={handleUseHint} className="hint-button">
          힌트 사용
        </button>
        
        <button onClick={initializeGame} className="restart-button">
          재시작
        </button>
      </div>
      
      <div 
        className="card-grid"
        style={{ 
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`
        }}
      >
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <span>?</span>
              </div>
              <div className="card-back">
                <span>{card.image}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {gameOver && (
        <div className="game-over-modal">
          <h3>게임 완료!</h3>
          <p>이동 횟수: {moves}</p>
          <p>시간: {formatTime(gameTime)}</p>
        </div>
      )}
    </div>
  );
}

export default MemoryMatch; 
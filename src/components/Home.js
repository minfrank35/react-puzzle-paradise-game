import React from 'react';
import { Link } from 'react-router-dom';
import AdComponent from './AdComponent';

// 게임 목록 데이터
const games = [
  { id: 'number-puzzle', name: '숫자 퍼즐', description: '숫자를 정렬하는 스도쿠 스타일의 퍼즐 게임입니다.' },
  { id: 'word-search', name: '단어 찾기', description: '격자 속에 숨겨진 단어를 찾아보세요.' },
  { id: 'memory-match', name: '메모리 매칭', description: '카드를 뒤집어 같은 짝을 찾는 게임입니다.' },
  { id: 'color-sort', name: '색상 정렬', description: '색상을 올바른 순서로 정렬하는 퍼즐입니다.' },
  { id: 'pattern-match', name: '패턴 인식', description: '숨겨진 패턴을 찾고 이해하는 게임입니다.' },
];

function Home() {
  return (
    <div className="home-container">
      <h2>퍼즐 게임 선택</h2>
      
      <div className="game-grid">
        {games.map((game) => (
          <div className="game-card" key={game.id}>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <Link to={`/game/${game.id}`} className="play-button">
              게임 시작
            </Link>
          </div>
        ))}
      </div>
      
      {/* 상단 광고 배너 */}
      <div className="home-ad-banner">
        <AdComponent 
          adSlot="9876543210" // 실제 광고 슬롯 ID로 대체 필요
          format="horizontal" 
          responsive={true}
        />
        <p className="ad-label">광고</p>
      </div>
      
      <div className="home-features">
        <div className="feature-card daily-challenge-banner">
          <h3>오늘의 도전!</h3>
          <p>매일 새로운 퍼즐을 풀고 보상을 받으세요.</p>
          <Link to="/daily-challenge" className="challenge-button">
            도전하기
          </Link>
        </div>
        
        <div className="feature-card leaderboard-banner">
          <h3>리더보드</h3>
          <p>최고 점수를 확인하고 친구들과 경쟁해보세요!</p>
          <Link to="/leaderboard" className="leaderboard-button">
            순위보기
          </Link>
        </div>
      </div>
      
      {/* 하단 광고 배너 */}
      <div className="home-ad-banner bottom-ad">
        <AdComponent 
          adSlot="5432109876" // 실제 광고 슬롯 ID로 대체 필요
          format="rectangle" 
          responsive={true}
        />
        <p className="ad-label">광고</p>
      </div>
    </div>
  );
}

export default Home; 
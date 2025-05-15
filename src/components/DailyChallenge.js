import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 주의: 실제 프로덕션에서는 서버에서 도전 과제 데이터를 받아와야 합니다
// 이 데이터는 데모용 예시입니다
const getDailyChallenge = () => {
  // 현재 날짜를 기반으로 챌린지 생성
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=일요일, 1=월요일, ..., 6=토요일
  
  const challenges = [
    { gameId: 'number-puzzle', name: '숫자 퍼즐', description: '5분 안에 퍼즐 5개 해결하기', reward: '포인트 2배' },
    { gameId: 'word-search', name: '단어 찾기', description: '10개 단어를 3분 안에 찾기', reward: '힌트 3개' },
    { gameId: 'memory-match', name: '메모리 매칭', description: '6x6 보드를 실수 5번 이내로 완료하기', reward: '보너스 점수 50점' },
    { gameId: 'color-sort', name: '색상 정렬', description: '어려운 난이도 2개 완료하기', reward: '특별 테마 해금' },
    { gameId: 'pattern-match', name: '패턴 인식', description: '연속으로 10개 패턴 맞추기', reward: '추가 도전 해금' },
    { gameId: 'memory-match', name: '메모리 매칭', description: '8x8 보드 완료하기', reward: '포인트 3배' },
    { gameId: 'number-puzzle', name: '숫자 퍼즐', description: '어려운 난이도 1개 완료하기', reward: '특별 배경 해금' },
  ];
  
  // 오늘의 요일에 맞는 챌린지 반환
  return challenges[dayOfWeek];
};

// 남은 시간 계산
const getRemainingTime = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return tomorrow - now;
};

function DailyChallenge() {
  const navigate = useNavigate();
  const [challenge] = useState(getDailyChallenge);
  const [remainingTime, setRemainingTime] = useState(getRemainingTime());
  const [isCompleted, setIsCompleted] = useState(false);
  
  // 남은 시간 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(getRemainingTime());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 로컬 스토리지에서 도전 완료 상태 확인
  useEffect(() => {
    const today = new Date().toDateString();
    const completed = localStorage.getItem(`challenge_${today}`) === 'completed';
    setIsCompleted(completed);
  }, []);
  
  // 시간 형식 변환 함수
  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // 도전 시작 함수
  const startChallenge = () => {
    // 광고 표시 후 게임 시작
    const adId = `ad-${Date.now()}`;
    navigate(`/ad/${adId}?returnTo=/game/${challenge.gameId}?challenge=true`);
  };
  
  // 보상 받기 함수
  const claimReward = () => {
    // 임시로 로컬 스토리지에 저장
    const today = new Date().toDateString();
    localStorage.setItem(`challenge_${today}`, 'completed');
    setIsCompleted(true);
    
    // 실제로는 여기서 포인트 업데이트 등의 작업 수행
    alert(`${challenge.reward}를 획득했습니다!`);
  };
  
  return (
    <div className="daily-challenge">
      <h2>오늘의 도전!</h2>
      
      <div className="challenge-timer">
        <p>다음 도전까지 남은 시간:</p>
        <div className="timer">{formatTime(remainingTime)}</div>
      </div>
      
      <div className="challenge-card">
        <h3>{challenge.name}</h3>
        <p className="challenge-description">{challenge.description}</p>
        
        <div className="challenge-reward">
          <h4>보상:</h4>
          <p>{challenge.reward}</p>
        </div>
        
        {!isCompleted ? (
          <button onClick={startChallenge} className="challenge-button">
            도전 시작
          </button>
        ) : (
          <div className="completed-banner">
            <p>오늘의 도전 완료!</p>
            <p>내일 다시 도전하세요.</p>
          </div>
        )}
      </div>
      
      {/* 임시: 데모용 보상 받기 버튼 */}
      {!isCompleted && (
        <button onClick={claimReward} className="demo-claim-button">
          (데모) 도전 완료하고 보상 받기
        </button>
      )}
    </div>
  );
}

export default DailyChallenge; 
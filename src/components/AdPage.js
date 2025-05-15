import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AdComponent from './AdComponent';

// 임시 광고 데이터 (AdSense로 대체되지 않는 경우를 위한 백업)
const ads = [
  {
    id: 'ad1',
    title: '신규 모바일 게임 출시!',
    content: '전략과 액션이 결합된 새로운 모바일 게임을 지금 다운로드하세요.',
    imageUrl: 'https://via.placeholder.com/400x300?text=Mobile+Game+Ad',
  },
  {
    id: 'ad2',
    title: '최신 스마트폰 할인 이벤트',
    content: '최신 기술이 탑재된 스마트폰을 특별 할인가로 만나보세요.',
    imageUrl: 'https://via.placeholder.com/400x300?text=Smartphone+Sale',
  },
  {
    id: 'ad3',
    title: '건강한 식습관을 위한 밀키트',
    content: '집에서 쉽게 요리하는 건강한 식사, 첫 주문 30% 할인!',
    imageUrl: 'https://via.placeholder.com/400x300?text=Meal+Kit+Delivery',
  },
];

function AdPage() {
  const { adId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const returnTo = queryParams.get('returnTo') || '/';
  const score = queryParams.get('score');
  
  const [timeLeft, setTimeLeft] = useState(5); // 5초 광고
  const [adWatched, setAdWatched] = useState(false);
  const [useRealAd, setUseRealAd] = useState(true); // 실제 광고 사용 여부
  const [adError, setAdError] = useState(false);
  
  // 랜덤 광고 선택 (백업용)
  const randomAd = ads[Math.floor(Math.random() * ads.length)];
  
  // 타이머 설정
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setAdWatched(true);
    }
  }, [timeLeft]);
  
  // AdSense 오류 발생 시 백업 광고 표시를 위한 핸들러
  const handleAdError = () => {
    setUseRealAd(false);
    setAdError(true);
    console.log('AdSense 광고 로드 실패, 백업 광고 표시');
  };
  
  // 광고 시청 완료 후 돌아가기
  const returnToGame = () => {
    navigate(returnTo);
  };
  
  return (
    <div className="ad-page">
      <div className="ad-container">
        <h2>{useRealAd ? '스폰서 광고' : randomAd.title}</h2>
        
        <div className="ad-content">
          {useRealAd ? (
            // Google AdSense 광고
            <div className="real-ad-container">
              {/* 가로 배너 광고 (예시) */}
              <AdComponent 
                adSlot="1234567890" // 실제 광고 슬롯 ID로 대체 필요
                format="horizontal"
                responsive={true}
              />
            </div>
          ) : (
            // 백업 광고
            <>
              <img src={randomAd.imageUrl} alt="광고 이미지" className="ad-image" />
              <p>{randomAd.content}</p>
              {adError && <p className="ad-error-message">* 광고 서비스 연결에 문제가 있어 대체 광고가 표시됩니다.</p>}
            </>
          )}
        </div>
        
        {!adWatched ? (
          <div className="ad-timer">
            <p>광고가 {timeLeft}초 후에 종료됩니다...</p>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${(1 - timeLeft / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="ad-controls">
            {score && <div className="game-score">최종 점수: {score}점</div>}
            
            <button onClick={returnToGame} className="continue-button">
              계속하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdPage; 